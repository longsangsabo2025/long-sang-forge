import { useAuth } from "@/components/auth/AuthProvider";
import { LoginModal } from "@/components/auth/LoginModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  calculateEndTime,
  createConsultation,
  formatTime,
  getAvailableTimeSlots,
  getConsultationTypes,
  type ConsultationType,
  type TimeSlot,
} from "@/lib/api/consultations";
import { Calendar as CalendarIcon, Clock, LogIn, Mail, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PaymentStep } from "./PaymentStep";

interface BookingFormProps {
  consultantId?: string; // Optional - NULL nếu không có consultant cụ thể
  defaultDuration?: number; // Duration để tự động chọn gói (30, 60, 120)
  onSuccess?: () => void;
}

export function BookingForm({ consultantId, defaultDuration, onSuccess }: BookingFormProps) {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Form data - auto-fill from user if logged in
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");

  // Payment step
  const [showPayment, setShowPayment] = useState(false);

  // Login modal
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Auto-fill user info when logged in
  useEffect(() => {
    if (user) {
      setClientEmail(user.email || "");
      // Try to get name from user metadata
      const metadata = user.user_metadata;
      if (metadata?.full_name) {
        setClientName(metadata.full_name);
      } else if (metadata?.name) {
        setClientName(metadata.name);
      }
      if (metadata?.phone) {
        setClientPhone(metadata.phone);
      }
    }
  }, [user]);

  useEffect(() => {
    loadConsultationTypes();
  }, []);

  // Tự động chọn gói tư vấn dựa trên defaultDuration
  useEffect(() => {
    if (defaultDuration && consultationTypes.length > 0) {
      const matchingType = consultationTypes.find((t) => t.duration_minutes === defaultDuration);
      if (matchingType) {
        setSelectedType(matchingType.id);
      }
    }
  }, [defaultDuration, consultationTypes]);

  useEffect(() => {
    if (selectedDate && selectedType) {
      loadTimeSlots();
    }
  }, [selectedDate, selectedType]);

  const loadConsultationTypes = async () => {
    try {
      const types = await getConsultationTypes();
      setConsultationTypes(types);
      // Chỉ auto-select nếu không có defaultDuration
      if (types.length > 0 && !defaultDuration) {
        setSelectedType(types[0].id);
      }
    } catch (error) {
      toast.error(t("consultation.bookingForm.errorLoadTypes"));
      console.error(error);
    }
  };

  const loadTimeSlots = async () => {
    if (!selectedDate || !selectedType) return;

    setLoadingSlots(true);
    try {
      const type = consultationTypes.find((t) => t.id === selectedType);
      if (!type) return;

      const dateStr = selectedDate.toISOString().split("T")[0];
      const slots = await getAvailableTimeSlots(consultantId, dateStr, type.duration_minutes);
      setTimeSlots(slots);
    } catch (error) {
      toast.error(t("consultation.bookingForm.errorLoadSlots"));
      console.error(error);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Handle form validation before payment
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime || !selectedType || !clientName || !clientEmail) {
      toast.error(t("consultation.bookingForm.errorFillAll"));
      return;
    }

    const type = consultationTypes.find((t) => t.id === selectedType);
    if (!type) return;

    // If free consultation, submit directly
    if (!type.price || type.price === 0) {
      handleSubmit();
      return;
    }

    // Show payment step for paid consultations
    setShowPayment(true);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedType) {
      toast.error(t("consultation.bookingForm.errorFillAll"));
      return;
    }

    const type = consultationTypes.find((t) => t.id === selectedType);
    if (!type) return;

    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const endTime = calculateEndTime(selectedTime, type.duration_minutes);

      // Build consultation data - chỉ include consultant_id nếu có
      const consultationData: Parameters<typeof createConsultation>[0] = {
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        consultation_date: dateStr,
        start_time: selectedTime,
        end_time: endTime,
        duration_minutes: type.duration_minutes,
        status: "pending",
        consultation_type: type.name,
        notes,
        // Payment fields - quan trọng cho Casso webhook matching
        payment_status: type.price && type.price > 0 ? "pending" : undefined,
        payment_amount: type.price && type.price > 0 ? type.price : undefined,
        // User ID for subscription bonus
        user_id: user?.id,
      };

      // Chỉ thêm consultant_id nếu có giá trị hợp lệ (UUID)
      if (consultantId && consultantId !== "default-consultant-id") {
        consultationData.consultant_id = consultantId;
      }

      await createConsultation(consultationData);

      toast.success(t("consultation.bookingForm.successMsg"));

      // Send email via Supabase Edge Function (fire and forget)
      const edgeFnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;
      const emailHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      };

      // Confirmation to client
      fetch(edgeFnUrl, {
        method: "POST",
        headers: emailHeaders,
        body: JSON.stringify({
          to: clientEmail,
          template: "consultationBooked",
          data: { name: clientName, date: dateStr, time: selectedTime, type: type.name },
        }),
      }).catch((err) => console.warn("Booking email failed:", err));

      // Notify admin (with payment info for paid consultations)
      fetch(edgeFnUrl, {
        method: "POST",
        headers: emailHeaders,
        body: JSON.stringify({
          to: "longsangsabo@gmail.com",
          template: "adminConsultationBooked",
          data: {
            name: clientName,
            email: clientEmail,
            phone: clientPhone,
            date: dateStr,
            time: selectedTime,
            type: type.name,
            notes: notes || "Không có ghi chú",
            price: type.price ? `${type.price.toLocaleString("vi-VN")}đ` : "Miễn phí",
            paymentStatus: type.price && type.price > 0 ? "Chờ xác nhận" : "Miễn phí",
          },
        }),
      }).catch((err) => console.warn("Admin email failed:", err));

      // Reset form
      setClientName("");
      setClientEmail("");
      setClientPhone("");
      setNotes("");
      setSelectedDate(undefined);
      setSelectedTime("");
      setShowPayment(false);

      onSuccess?.();
    } catch (error) {
      toast.error(t("consultation.bookingForm.errorSubmit"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const selectedTypeData = consultationTypes.find((t) => t.id === selectedType);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="py-8 text-center">
          <div className="animate-pulse text-muted-foreground">{t("auth.authenticating")}</div>
        </CardContent>
      </Card>
    );
  }

  // Require login to book
  if (!user) {
    return (
      <>
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>{t("consultation.bookingForm.loginRequired")}</CardTitle>
            <CardDescription>{t("consultation.bookingForm.loginRequiredDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" size="lg" onClick={() => setShowLoginModal(true)}>
              <LogIn className="w-4 h-4 mr-2" />
              {t("consultation.bookingForm.loginButton")}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t("consultation.bookingForm.noAccount")}{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => setShowLoginModal(true)}>
                {t("consultation.bookingForm.registerNow")}
              </Button>
            </p>
          </CardContent>
        </Card>
        <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      </>
    );
  }

  // Show full-width payment step
  if (showPayment && selectedTypeData) {
    return (
      <div className="max-w-4xl mx-auto">
        <PaymentStep
          amount={selectedTypeData.price || 0}
          bookingInfo={{
            name: clientName,
            email: clientEmail,
            date: selectedDate?.toLocaleDateString("vi-VN") || "",
            time: selectedTime,
            type: selectedTypeData.name,
          }}
          onPaymentConfirmed={handleSubmit}
          onBack={() => setShowPayment(false)}
          loading={loading}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Calendar & Time Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {t("consultation.bookingForm.selectDateTime")}
          </CardTitle>
          <CardDescription>{t("consultation.bookingForm.selectDateTimeDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Consultation Type */}
          <div className="space-y-2">
            <Label>{t("consultation.bookingForm.consultationType")}</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder={t("consultation.bookingForm.selectType")} />
              </SelectTrigger>
              <SelectContent>
                {consultationTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: type.color }}
                      />
                      <span>{type.name}</span>
                      {type.price && type.price > 0 ? (
                        <Badge variant="secondary" className="ml-1">
                          {type.price.toLocaleString("vi-VN")}đ
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="ml-1 text-green-600 border-green-600">
                          {t("consultation.bookingForm.free")}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTypeData && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{selectedTypeData.description}</p>
                <p className="text-sm font-medium">
                  {t("consultation.bookingForm.consultationFee")}{" "}
                  {selectedTypeData.price && selectedTypeData.price > 0 ? (
                    <span className="text-primary">
                      {selectedTypeData.price.toLocaleString("vi-VN")}đ
                    </span>
                  ) : (
                    <span className="text-green-600">{t("consultation.bookingForm.free")}</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Calendar */}
          <div className="space-y-2">
            <Label>{t("consultation.bookingForm.selectDate")}</Label>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const dayOfWeek = date.getDay();
                  // Disable quá khứ và Chủ nhật (0)
                  return date < today || dayOfWeek === 0;
                }}
                className="rounded-md border p-3"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse",
                  head_row: "flex justify-between",
                  head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2 justify-between",
                  cell: "text-center text-sm p-0 relative",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md",
                  day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
                  day_hidden: "invisible",
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              * {t("consultation.bookingForm.sundayNote")}
            </p>
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t("consultation.bookingForm.selectTime")}
              </Label>
              {loadingSlots ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="animate-pulse">{t("consultation.bookingForm.loadingSlots")}</div>
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground bg-muted/50 rounded-lg">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>{t("consultation.bookingForm.noSlotsAvailable")}</p>
                  <p className="text-xs mt-1">
                    {t("consultation.bookingForm.pleaseSelectAnotherDate")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Morning slots */}
                  {timeSlots.filter((s) => parseInt(s.time.split(":")[0]) < 12).length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {t("consultation.bookingForm.morning")}
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {timeSlots
                          .filter((s) => parseInt(s.time.split(":")[0]) < 12)
                          .map((slot) => (
                            <Button
                              key={slot.time}
                              type="button"
                              variant={selectedTime === slot.time ? "default" : "outline"}
                              disabled={!slot.available}
                              onClick={() => setSelectedTime(slot.time)}
                              size="sm"
                              className="h-auto py-2 text-xs"
                            >
                              {slot.time}
                            </Button>
                          ))}
                      </div>
                    </div>
                  )}
                  {/* Afternoon slots */}
                  {timeSlots.filter((s) => parseInt(s.time.split(":")[0]) >= 12).length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {t("consultation.bookingForm.afternoon")}
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {timeSlots
                          .filter((s) => parseInt(s.time.split(":")[0]) >= 12)
                          .map((slot) => (
                            <Button
                              key={slot.time}
                              type="button"
                              variant={selectedTime === slot.time ? "default" : "outline"}
                              disabled={!slot.available}
                              onClick={() => setSelectedTime(slot.time)}
                              size="sm"
                              className="h-auto py-2 text-xs"
                            >
                              {slot.time}
                            </Button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("consultation.bookingForm.contactInfo")}
          </CardTitle>
          <CardDescription>{t("consultation.bookingForm.contactDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProceedToPayment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {t("consultation.bookingForm.fullName")} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder={t("consultation.bookingForm.namePlaceholder")}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                {t("consultation.bookingForm.email")} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("consultation.bookingForm.phone")}</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0901234567"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t("consultation.bookingForm.notes")}</Label>
              <Textarea
                id="notes"
                placeholder={t("consultation.bookingForm.notesPlaceholder")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            {/* Summary */}
            {selectedDate && selectedTime && selectedTypeData && (
              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    {t("consultation.bookingForm.bookingSummary")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("consultation.bookingForm.consultationType")}:
                    </span>
                    <Badge style={{ backgroundColor: selectedTypeData.color }}>
                      {selectedTypeData.name}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("consultation.bookingForm.date")}:
                    </span>
                    <span className="font-medium">
                      {selectedDate.toLocaleDateString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("consultation.bookingForm.time")}:
                    </span>
                    <span className="font-medium">
                      {formatTime(selectedTime)} -{" "}
                      {formatTime(
                        calculateEndTime(selectedTime, selectedTypeData.duration_minutes)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("consultation.bookingForm.duration")}:
                    </span>
                    <span className="font-medium">
                      {selectedTypeData.duration_minutes} {t("consultation.bookingForm.minutes")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading || !selectedDate || !selectedTime}
            >
              {loading
                ? t("consultation.bookingForm.processing")
                : selectedTypeData?.price && selectedTypeData.price > 0
                ? t("consultation.bookingForm.proceedToPayment")
                : t("consultation.bookingForm.submitButton")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
