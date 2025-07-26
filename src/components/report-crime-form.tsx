"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { createCrimeReport } from "@/lib/reports";
import { extractDetailsFromImage } from "@/lib/gemini";
import dynamic from "next/dynamic";
import { Loader2, MapPin, Image as ImageIcon, AlertCircle } from "lucide-react";
import { ReportSuccess } from "./report-success";

// Preload Leaflet assets
const preloadLeaflet = () => {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    link.as = 'style';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
    script.async = true;
    document.head.appendChild(script);
  }
};

const MapPicker = dynamic(() => {
  preloadLeaflet();
  return import("@/components/map-picker");
}, {
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-gray-50 rounded-lg flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  ),
});

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  crimeType: z.string({ required_error: "Please select a crime type." }),
  date: z.string({ required_error: "Please select a date." }),
  time: z.string({ required_error: "Please select a time." }),
  address: z.string().min(5, { message: "Please enter a valid address." }),
  isAnonymous: z.boolean(),
  reporterContact: z.string().optional(),
});

type ReportFormValues = z.infer<typeof formSchema>;

interface ReportCrimeFormProps {
  isAnonymousMode?: boolean;
  onSuccess?: (trackingId?: string) => void;
}

function parseDDMMYYYYtoISO(dateStr: string) {
  const [day, month, year] = dateStr.split("/");
  if (!day || !month || !year) return "";
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function formatISOToDDMMYYYY(iso: string) {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

function formatTimeToHHMM(time: string) {
  if (!time) return "";
  const [h, m] = time.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

export function ReportCrimeForm({ isAnonymousMode = false, onSuccess }: ReportCrimeFormProps) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [mapCoordinates, setMapCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [formStep, setFormStep] = useState<"details" | "location" | "review">("details");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const today = new Date();
  const defaultDate = today.toLocaleDateString("en-GB");
  const defaultTime = today.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });

  const [incidentDate, setIncidentDate] = useState<string>(defaultDate);
  const [incidentTime, setIncidentTime] = useState<string>(defaultTime);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      crimeType: "",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().slice(0, 5),
      address: "",
      isAnonymous: !user,
    },
  });

  // --- All hooks above this line ---

  // Early return after all hooks
  useEffect(() => {
    if (!loading && isAdmin && typeof window !== "undefined") {
      if (!sessionStorage.getItem("adminReportToastShown")) {
        toast.error("Admins cannot submit reports.");
        sessionStorage.setItem("adminReportToastShown", "1");
      }
    }
  }, [isAdmin, loading]);

  useEffect(() => {
    if (user?.email) {
      form.register("reporterContact");
      form.setValue("reporterContact", user.email);
    } else {
      form.unregister("reporterContact");
    }
  }, [user, form]);

  useEffect(() => {
    if (!form.getValues("address") && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          form.setValue("address", `Near ${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`);
          setTimeout(() => getFullAddress(position), 0);
        },
        () => {},
        { maximumAge: 60000, timeout: 3000 }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  async function getFullAddress(position: GeolocationPosition) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
      );
      const data = await response.json();
      if (data?.display_name) {
        form.setValue("address", data.display_name);
      }
    } catch (error) {
      // Background geocoding failed
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const newImages = Array.from(files).slice(0, 3 - selectedImages.length);
    const newUrls = newImages.map(file => URL.createObjectURL(file));
    setSelectedImages(prev => [...prev, ...newImages]);
    setImageUrls(prev => [...prev, ...newUrls]);
  }

  function removeImage(index: number) {
    setSelectedImages((prev) => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages;
    });
    setImageUrls((prev) => {
      const newUrls = [...prev];
      URL.revokeObjectURL(newUrls[index]);
      newUrls.splice(index, 1);
      return newUrls;
    });
  }

  async function processImage() {
    if (selectedImages.length === 0) {
      toast.error("Please upload an image first");
      return;
    }
    try {
      setIsProcessingImage(true);
      const toastId = toast.loading("Analyzing image for details...");
      const imageFile = selectedImages[0];
      const extractedDetails = await extractDetailsFromImage(imageFile);
      if (extractedDetails) {
        form.setValue("title", extractedDetails.TITLE);
        form.setValue("description", extractedDetails.DESCRIPTION);
        form.setValue("crimeType", extractedDetails.TYPE);
        toast.success("Details extracted from image", { id: toastId });
        await form.trigger([
          "title",
          "description",
          "crimeType",
          "date",
          "time"
        ]);
      } else {
        toast.error("Could not extract details from image", { id: toastId });
      }
    } catch (error) {
      toast.error("Failed to process image");
    } finally {
      setIsProcessingImage(false);
    }
  }

  function handleLocationSelect(lat: number, lng: number, address: string) {
    setMapCoordinates({ lat, lng });
    form.setValue("address", address);
    form.trigger("address");
  }

  function isLocationValid() {
    const address = form.getValues("address");
    return address && address.length > 5;
  }

  const handleSubmit = async (values: ReportFormValues) => {
    if (!isLocationValid()) {
      toast.error("Cannot submit: Please select a valid location on the map or enter a valid address.");
      return;
    }
    setIsLoading(true);
    try {
      let trackingId: string | undefined = undefined;
      const geoPoint = mapCoordinates
        ? { latitude: mapCoordinates.lat, longitude: mapCoordinates.lng }
        : { latitude: 23.373576, longitude: 82.840088 };
      const isoDate = parseDDMMYYYYtoISO(incidentDate);
      const isoDateTime = isoDate && incidentTime ? `${isoDate}T${incidentTime}:00` : null;

      let reportData: any = {
        title: values.title,
        description: values.description,
        crimeType: values.crimeType,
        location: values.address,
        geoPoint,
        images: selectedImages,
        status: "pending",
        isAnonymous: isAnonymousMode,
        reporterId: user ? user.uid : null,
        reporterName: user ? user.displayName : null,
        reporterContact: user && !isAnonymousMode ? user.email : null,
        actionDetails: undefined,
        incidentDate: values.date,
        incidentTime: values.time,
        incidentDateTime: isoDateTime ? new Date(isoDateTime).toISOString() : null,
        userId: user ? user.uid : null,
      };

      if (user && user.displayName) {
        reportData.reporterName = user.displayName;
      }
      if (user && user.email && !isAnonymousMode) {
        reportData.reporterContact = user.email;
      }

      const created = await createCrimeReport(reportData, selectedImages);
      setIsLoading(false);
      form.reset({
        title: "",
        description: "",
        crimeType: "",
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().slice(0, 5),
        address: "",
        isAnonymous: !user,
      });
      setSelectedImages([]);
      setImageUrls([]);
      setMapCoordinates(null);
      if (onSuccess) onSuccess(created.trackingId);
      else setTrackingId(created.trackingId);
    } catch (error) {
      setIsLoading(false);
      toast.error("Failed to submit report");
    }
  };

  const crimeTypes = [
    { value: "theft", label: "Theft" },
    { value: "burglary", label: "Burglary" },
    { value: "assault", label: "Assault" },
    { value: "fraud", label: "Fraud" },
    { value: "vandalism", label: "Vandalism" },
    { value: "suspicious-activity", label: "Suspicious Activity" },
    { value: "other", label: "Other" },
  ];

  // Early return after all hooks
  if (!loading && isAdmin) {
    return null;
  }

  if (trackingId) {
    return <ReportSuccess trackingId={trackingId} user={user} />;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
      <div className="bg-primary px-8 py-6">
        <h2 className="text-2xl font-bold text-white">
          Crime Incident Report
        </h2>
        <p className="text-primary-foreground/90 mt-1">
          Help keep your community safe by reporting criminal activity
        </p>
      </div>
      <div className="px-8 pt-6 pb-2 border-b">
        <div className="flex items-center justify-between">
          {["details", "location", "review"].map((step, index) => (
            <div key={step} className="flex items-center">
              <button
                type="button"
                disabled={
                  (step === "location" && (
                    !form.getValues("title") ||
                    !form.getValues("crimeType") ||
                    !form.getValues("description") ||
                    !form.getValues("date") ||
                    !form.getValues("time") ||
                    !form.formState.isValid
                  )) ||
                  (step === "review" && (
                    !form.getValues("address") ||
                    (form.getValues("isAnonymous") === false && !form.getValues("reporterContact")) ||
                    !form.formState.isValid
                  ))
                }
                onClick={() => setFormStep(step as any)}
                className={`flex items-center justify-center w-8 h-8 rounded-full ${formStep === step ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'} font-medium`}
              >
                {index + 1}
              </button>
              {index < 2 && (
                <div className={`w-16 h-0.5 mx-2 ${formStep === step || (formStep === "review" && index === 0) ? 'bg-primary' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-500">
          <span className={formStep === "details" ? "text-primary font-medium" : ""}>Incident Details</span>
          <span className={formStep === "location" ? "text-primary font-medium" : ""}>Location</span>
          <span className={formStep === "review" ? "text-primary font-medium" : ""}>Review</span>
        </div>
      </div>
      <div className="p-8">
        <Form {...form}>
          <form
            onSubmit={e => {
              const submitter = (e.nativeEvent as SubmitEvent).submitter;
              if (
                submitter &&
                ((submitter instanceof HTMLButtonElement && submitter.type === "submit") ||
                 (submitter instanceof HTMLInputElement && submitter.type === "submit"))
              ) {
                form.handleSubmit(handleSubmit)(e);
              } else {
                e.preventDefault();
                return false;
              }
            }}
            className="space-y-8"
            onKeyDown={e => {
              const tag = (e.target as HTMLElement).tagName.toLowerCase();
              const type = (e.target as HTMLInputElement).type;
              if (e.key === "Enter") {
                if (tag === "textarea") return;
                if (tag === "input" && (type === "text" || type === "email" || type === "search")) return;
                e.preventDefault();
              }
            }}
          >
            <AnimatePresence mode="wait">
              {formStep === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Incident Title*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brief title describing the incident"
                            className="focus:ring-2 focus:ring-primary/50"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Be concise but descriptive
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="crimeType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type of Crime*</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="focus:ring-2 focus:ring-primary/50">
                              <SelectValue placeholder="Select crime type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {crimeTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Detailed Description*</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide a detailed account of what happened..."
                            className="min-h-[150px] focus:ring-2 focus:ring-primary/50"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Include date, time, people involved, and any other relevant details
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Incident*</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="focus:ring-2 focus:ring-primary/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Approximate Time*</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              className="focus:ring-2 focus:ring-primary/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <FormLabel>Upload Evidence (Optional)</FormLabel>
                      <div className="flex items-center gap-4 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2"
                        >
                          <ImageIcon className="h-4 w-4" />
                          Add Photos
                        </Button>
                        {selectedImages.length > 0 && (
                          <Button
                            type="button"
                            onClick={processImage}
                            disabled={isProcessingImage}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            {isProcessingImage ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <span>Extract Details from Image</span>
                            )}
                          </Button>
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                      <FormDescription>
                        Upload up to 3 images (max 5MB each)
                      </FormDescription>
                    </div>

                    {imageUrls.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                              {url ? (
                                <img
                                  src={url}
                                  alt={`Evidence ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 animate-pulse" />
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              <AlertCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      disabled
                      className="invisible"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={async () => {
                        const isValid = await form.trigger([
                          "title",
                          "crimeType",
                          "description",
                          "date",
                          "time"
                        ]);
                        if (isValid) setFormStep("location");
                      }}
                      className="ml-auto"
                      disabled={
                        !form.watch("title") ||
                        !form.watch("crimeType") ||
                        !form.watch("description") ||
                        !form.watch("date") ||
                        !form.watch("time") ||
                        !!form.formState.errors.title ||
                        !!form.formState.errors.crimeType ||
                        !!form.formState.errors.description ||
                        !!form.formState.errors.date ||
                        !!form.formState.errors.time
                      }
                    >
                      Continue to Location
                    </Button>
                  </div>
                </motion.div>
              )}

              {formStep === "location" && (
                <motion.div
                  key="location"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <FormLabel>Incident Location*</FormLabel>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>Click on the map or enter address below</span>
                    </div>
                  </div>

                  <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm relative">
                    <MapPicker
                      onLocationSelect={handleLocationSelect}
                      initialAddress={form.getValues("address")}
                      initialCoordinates={
                        mapCoordinates
                          ? [mapCoordinates.lat, mapCoordinates.lng]
                          : undefined
                      }
                    />
                    <button
                      type="button"
                      disabled={isGettingLocation}
                      title="Return to my current location"
                      className={`
                        absolute z-10 bottom-4 right-4
                        bg-white dark:bg-gray-800
                        border border-gray-300 dark:border-gray-600
                        shadow-lg rounded-full p-3
                        hover:bg-primary hover:text-white
                        transition-all duration-200
                        flex items-center justify-center
                        ${isGettingLocation ? 'opacity-70 cursor-not-allowed' : ''}
                      `}
                      onClick={async () => {
                        if (navigator.geolocation) {
                          setIsGettingLocation(true);
                          toast.loading("Getting your current location...");
                          navigator.geolocation.getCurrentPosition(
                            async (position) => {
                              setIsGettingLocation(false);
                              toast.dismiss();
                              setMapCoordinates({
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                              });
                              form.setValue(
                                "address",
                                `Near ${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`
                              );
                              try {
                                const response = await fetch(
                                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
                                );
                                const data = await response.json();
                                if (data?.display_name) {
                                  form.setValue("address", data.display_name);
                                  await form.trigger("address");
                                } else {
                                  await form.trigger("address");
                                }
                              } catch {
                                await form.trigger("address");
                              }
                              toast.success("Location updated to your current position");
                            },
                            (error) => {
                              setIsGettingLocation(false);
                              toast.dismiss();
                              toast.error("Unable to get your current position");
                            },
                            { maximumAge: 60000, timeout: 5000 }
                          );
                        } else {
                          toast.error("Geolocation is not supported by your browser");
                        }
                      }}
                    >
                      {isGettingLocation ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <MapPin className="h-6 w-6 text-gray-700 group-hover:text-white" />
                      )}
                    </button>
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Enter address or drag map marker"
                            className="focus:ring-2 focus:ring-primary/50"
                            {...field}
                            onBlur={async (e) => {
                              field.onBlur?.();
                              const address = e.target.value;
                              if (address && address.length > 5) {
                                try {
                                  const response = await fetch(
                                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
                                  );
                                  const data = await response.json();
                                  if (data && data[0]) {
                                    setMapCoordinates({
                                      lat: parseFloat(data[0].lat),
                                      lng: parseFloat(data[0].lon),
                                    });
                                  }
                                } catch {
                                }
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormStep("details")}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={async () => {
                        const isValid = await form.trigger(["address"]);
                        if (isValid && isLocationValid()) setFormStep("review");
                        else {
                          if (!isLocationValid()) {
                            toast.error("Please select a valid location on the map or enter a valid address.");
                          } else {
                            toast.error("Please add a valid address.");
                          }
                        }
                      }}
                      className="ml-auto"
                      disabled={
                        !form.watch("address") ||
                        !form.formState.isValid ||
                        !isLocationValid()
                      }
                    >
                      Review Report
                    </Button>
                  </div>
                </motion.div>
              )}

              {formStep === "review" && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-primary">Review Your Report</h3>
                    <p className="text-base text-gray-600">
                      Please verify all information before submitting.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-50 rounded-lg p-6 shadow-sm border">
                      <h4 className="font-semibold text-lg mb-4 text-primary">Incident Details</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500">Title</p>
                          <p className="font-medium">{form.getValues("title") || <span className="text-gray-400">Not specified</span>}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Type</p>
                          <p className="capitalize font-medium">
                            {crimeTypes.find(t => t.value === form.getValues("crimeType"))?.label || <span className="text-gray-400">Not specified</span>}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Description</p>
                          <p className="whitespace-pre-line font-medium text-justify">
                            {form.getValues("description") || <span className="text-gray-400">Not specified</span>}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Date &amp; Time</p>
                          <p className="font-medium">
                            {form.getValues("date") && form.getValues("time")
                              ? `${new Date(form.getValues("date")).toLocaleDateString()} at ${form.getValues("time")}`
                              : <span className="text-gray-400">Not specified</span>
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 shadow-sm border">
                      <h4 className="font-semibold text-lg mb-4 text-primary">Location &amp; Contact</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500">Address</p>
                          <p className="font-medium">{form.getValues("address") || <span className="text-gray-400">Not specified</span>}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Map Coordinates</p>
                          <p className="font-medium">
                            {mapCoordinates
                              ? `${mapCoordinates.lat.toFixed(6)}, ${mapCoordinates.lng.toFixed(6)}`
                              : <span className="text-gray-400">Not specified</span>
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Reporting As</p>
                          <p className="font-medium">
                            {form.getValues("isAnonymous")
                              ? "Anonymous"
                              : user ? <>{user.displayName}<br />{user.email}</> : <span className="text-gray-400">Not specified</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {imageUrls.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-lg mb-2 text-primary">Evidence Photos</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="aspect-square rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center">
                            {url ? (
                              <img
                                src={typeof url === "string" && url ? url : undefined}
                                alt={`Evidence ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={e => (e.currentTarget.style.display = "none")}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                No Image
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormStep("location")}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || !isLocationValid()}
                      className="gap-2"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      Submit Report
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Form>
      </div>
    </div>
  );
}