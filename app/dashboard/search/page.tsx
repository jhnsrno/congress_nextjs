"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Search } from "lucide-react";

interface ApplicantBase {
  id: number;
  lastname?: string;
  firstname?: string;
  middlename?: string;
  extension?: string;
  birthday?: string;
}

interface TupadApplicant extends ApplicantBase {
  created_at?: string;
  age?: number;
  sex?: string;
  civil_status?: string;
  barangay?: string;
  city_municipality?: string;
  province?: string;
  district?: string;
  type_of_id?: string;
  id_number?: string;
  contact_number?: string;
  bank_account_no?: string;
  type_of_beneficiary?: string;
  occupation?: string;
  monthly_income?: string;
  dependent_name?: string;
}

interface DohApplicant extends ApplicantBase {
  date?: string;
  hospital?: string;
  patient_lastname?: string;
  patient_firstname?: string;
  patient_middlename?: string;
  patient_extension?: string;
  age?: number;
  address?: string;
  city?: string;
  province?: string;
  diagnosis?: string;
  assistance_type?: string;
  recommended_amount?: string;
  applicant_lastname?: string;
  applicant_firstname?: string;
  applicant_middlename?: string;
  applicant_extension?: string;
  relationship?: string;
  contact_number?: string;
  type_of_id?: string;
  id_number?: string;
  bank_account_no?: string;
}

interface DswdApplicant {
  id: number;
  entered_date: string;
  entered_by: string;
  beneficiary_no: string;
  date_accomplished: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  district: string;
  lastname: string;
  firstname: string;
  middlename: string;
  extraname: string;
  sex: string;
  civil_status: string;
  dob: string;
  age: number;
  mode_of_admission: string;
  type_of_assistance1: string;
  amount1: string;
  beneficiary_category: string;
  sub_category: string;
  relationship: string;
  lastname2: string;
  firstname2: string;
  middlename2: string;
  extension: string;
  sex2: string;
  status2: string;
  dob2: string;
  age2: number;
  contact2: string;
  mode_of_assistance: string;
  interviewer: string;
  license_number: string;
  application_status?: string;
  reason: string;
}

interface VotersList {
  voters_lastname: string;
  voters_firstname: string;
  voters_middlename: string;
  voters_extension: string;
  precinct: string;
  barangay: string;
  municipality: string;
  province: string;
  region: string;
  district: string;
}

function TupadViewDetails({
  applicant,
  onClose,
}: {
  applicant: TupadApplicant;
  onClose: () => void;
}) {
  return (
    <DialogContent
      className="w-[600px] h-[90vh] max-w-full max-h-[95vh] p-0 rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 to-white shadow-xl overflow-hidden"
      style={{
        width: "600px",
        height: "90vh",
        maxWidth: "100vw",
        maxHeight: "95vh",
        padding: 0,
      }}
    >
      <div className="h-full overflow-y-auto p-8 space-y-8">
        <DialogHeader>
          <DialogTitle className="text-3xl font-extrabold text-red-700">
            TUPAD Applicant Details
          </DialogTitle>
          <DialogDescription className="text-md text-gray-600">
            Full details for {applicant.firstname} {applicant.lastname}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="border-b pb-4 border-red-100">
            <h3 className="font-semibold text-xl text-red-700 mb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <label className="text-gray-500">Full Name</label>
                <p className="font-medium text-gray-800">
                  {applicant.firstname} {applicant.middlename}{" "}
                  {applicant.lastname} {applicant.extension}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Birthday</label>
                <p className="font-medium text-gray-800">
                  {applicant.birthday
                    ? new Date(applicant.birthday).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                      })
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Age</label>
                <p className="font-medium text-gray-800">
                  {applicant.age || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Sex</label>
                <p className="font-medium text-gray-800">
                  {applicant.sex || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Civil Status</label>
                <p className="font-medium text-gray-800">
                  {applicant.civil_status || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Contact Number</label>
                <p className="font-medium text-gray-800">
                  {applicant.contact_number || "N/A"}
                </p>
              </div>
            </div>
          </div>
          {/* Address Information */}
          <div className="border-b pb-4 border-red-100">
            <h3 className="font-semibold text-xl text-red-700 mb-2">Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <label className="text-gray-500">Barangay</label>
                <p className="font-medium text-gray-800">
                  {applicant.barangay || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">City/Municipality</label>
                <p className="font-medium text-gray-800">
                  {applicant.city_municipality || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Province</label>
                <p className="font-medium text-gray-800">
                  {applicant.province || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">District</label>
                <p className="font-medium text-gray-800">
                  {applicant.district || "N/A"}
                </p>
              </div>
            </div>
          </div>
          {/* Identification & Financial */}
          <div className="border-b pb-4 border-red-100">
            <h3 className="font-semibold text-xl text-red-700 mb-2">
              Other Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <label className="text-gray-500">Type of ID</label>
                <p className="font-medium text-gray-800">
                  {applicant.type_of_id || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">ID Number</label>
                <p className="font-medium text-gray-800">
                  {applicant.id_number || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Bank Account No.</label>
                <p className="font-medium text-gray-800">
                  {applicant.bank_account_no || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Type of Beneficiary</label>
                <p className="font-medium text-gray-800">
                  {applicant.type_of_beneficiary || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Occupation</label>
                <p className="font-medium text-gray-800">
                  {applicant.occupation || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Monthly Income</label>
                <p className="font-medium text-gray-800">
                  {applicant.monthly_income
                    ? `Php ${Number(applicant.monthly_income).toLocaleString(
                        "en-PH",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Dependent Name</label>
                <p className="font-medium text-gray-800">
                  {applicant.dependent_name || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Date Created</label>
                <p className="font-medium text-gray-800">
                  {applicant.created_at
                    ? new Date(applicant.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "2-digit",
                        }
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button
            onClick={onClose}
            className="bg-red-700 hover:bg-red-800 text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  );
}

function DohViewDetails({
  applicant,
  onClose,
}: {
  applicant: DohApplicant;
  onClose: () => void;
}) {
  return (
    <DialogContent
      className="w-[600px] h-[90vh] max-w-full max-h-[95vh] p-0 rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 to-white shadow-xl overflow-hidden"
      style={{
        width: "600px",
        height: "90vh",
        maxWidth: "100vw",
        maxHeight: "95vh",
        padding: 0,
      }}
    >
      <div className="h-full overflow-y-auto p-8 space-y-8">
        <DialogHeader>
          <DialogTitle className="text-3xl font-extrabold text-red-700">
            DOH Applicant Details
          </DialogTitle>
          <DialogDescription className="text-md text-gray-600">
            Full details for {applicant.applicant_firstname}{" "}
            {applicant.applicant_lastname}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="border-b pb-4 border-red-100">
            <h3 className="font-semibold text-xl text-red-700 mb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <label className="text-gray-500">Applicant Name</label>
                <p className="font-medium text-gray-800">
                  {[
                    applicant.applicant_lastname,
                    applicant.applicant_firstname,
                    applicant.applicant_middlename,
                    applicant.applicant_extension,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Patient Name</label>
                <p className="font-medium text-gray-800">
                  {[
                    applicant.patient_lastname,
                    applicant.patient_firstname,
                    applicant.patient_middlename,
                    applicant.patient_extension,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Birthday</label>
                <p className="font-medium text-gray-800">
                  {applicant.birthday
                    ? new Date(applicant.birthday).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                      })
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Age</label>
                <p className="font-medium text-gray-800">
                  {applicant.age || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Relationship</label>
                <p className="font-medium text-gray-800">
                  {applicant.relationship || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Contact Number</label>
                <p className="font-medium text-gray-800">
                  {applicant.contact_number || "N/A"}
                </p>
              </div>
            </div>
          </div>
          {/* Address Information */}
          <div className="border-b pb-4 border-red-100">
            <h3 className="font-semibold text-xl text-red-700 mb-2">Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <label className="text-gray-500">Address</label>
                <p className="font-medium text-gray-800">
                  {applicant.address || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">City</label>
                <p className="font-medium text-gray-800">
                  {applicant.city || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Province</label>
                <p className="font-medium text-gray-800">
                  {applicant.province || "N/A"}
                </p>
              </div>
            </div>
          </div>
          {/* Medical & Financial Details */}
          <div className="border-b pb-4 border-red-100">
            <h3 className="font-semibold text-xl text-red-700 mb-2">
              Medical & Financial Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <label className="text-gray-500">Hospital</label>
                <p className="font-medium text-gray-800">
                  {applicant.hospital || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Diagnosis</label>
                <p className="font-medium text-gray-800">
                  {applicant.diagnosis || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Assistance Type</label>
                <p className="font-medium text-gray-800">
                  {applicant.assistance_type || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Recommended Amount</label>
                <p className="font-medium text-gray-800">
                  {applicant.recommended_amount
                    ? `Php ${Number(
                        applicant.recommended_amount
                      ).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Date</label>
                <p className="font-medium text-gray-800">
                  {applicant.date
                    ? new Date(applicant.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button
            onClick={onClose}
            className="bg-red-700 hover:bg-red-800 text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  );
}

function DswdViewDetails({
  applicant,
  onClose,
}: {
  applicant: DswdApplicant;
  onClose: () => void;
}) {
  return (
    <DialogContent
      className="w-[600px] h-[90vh] max-w-full max-h-[95vh] p-0 rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 to-white shadow-xl overflow-hidden"
      style={{
        width: "600px",
        height: "90vh",
        maxWidth: "100vw",
        maxHeight: "95vh",
        padding: 0,
      }}
    >
      <div className="h-full overflow-y-auto p-8 space-y-8">
        <DialogHeader>
          <DialogTitle className="text-3xl font-extrabold text-red-700">
            DSWD Applicant Details
          </DialogTitle>
          <DialogDescription className="text-md text-gray-600">
            Full details for {applicant.firstname} {applicant.lastname}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="border-b pb-4 border-red-100">
            <h3 className="font-semibold text-xl text-red-700 mb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <label className="text-gray-500">Full Name</label>
                <p className="font-medium text-gray-800">
                  {[
                    applicant.lastname,
                    applicant.firstname,
                    applicant.middlename,
                    applicant.extraname,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Date of Birth</label>
                <p className="font-medium text-gray-800">
                  {applicant.dob
                    ? new Date(applicant.dob).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                      })
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Age</label>
                <p className="font-medium text-gray-800">
                  {applicant.age || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Sex</label>
                <p className="font-medium text-gray-800">
                  {applicant.sex || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Civil Status</label>
                <p className="font-medium text-gray-800">
                  {applicant.civil_status || "N/A"}
                </p>
              </div>
            </div>
          </div>
          {/* Address Information */}
          <div className="border-b pb-4 border-red-100">
            <h3 className="font-semibold text-xl text-red-700 mb-2">Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <label className="text-gray-500">Barangay</label>
                <p className="font-medium text-gray-800">
                  {applicant.barangay || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">City</label>
                <p className="font-medium text-gray-800">
                  {applicant.city || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Province</label>
                <p className="font-medium text-gray-800">
                  {applicant.province || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Region</label>
                <p className="font-medium text-gray-800">
                  {applicant.region || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">District</label>
                <p className="font-medium text-gray-800">
                  {applicant.district || "N/A"}
                </p>
              </div>
            </div>
          </div>
          {/* Beneficiary Information */}
          <div className="border-b pb-4 border-red-100">
            <h3 className="font-semibold text-xl text-red-700 mb-2">
              Beneficiary Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <label className="text-gray-500">Beneficiary No.</label>
                <p className="font-medium text-gray-800">
                  {applicant.beneficiary_no || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Beneficiary Category</label>
                <p className="font-medium text-gray-800">
                  {applicant.beneficiary_category || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Sub Category</label>
                <p className="font-medium text-gray-800">
                  {applicant.sub_category || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Type of Assistance</label>
                <p className="font-medium text-gray-800">
                  {applicant.type_of_assistance1 || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Amount</label>
                <p className="font-medium text-gray-800">
                  {applicant.amount1
                    ? `Php ${Number(applicant.amount1).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Mode of Assistance</label>
                <p className="font-medium text-gray-800">
                  {applicant.mode_of_assistance || "N/A"}
                </p>
              </div>
            </div>
          </div>
          {/* Secondary Contact Information */}
          <div className="border-b pb-4 border-red-100">
            <h3 className="font-semibold text-xl text-red-700 mb-2">
              Secondary Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <label className="text-gray-500">Full Name</label>
                <p className="font-medium text-gray-800">
                  {[
                    applicant.lastname2,
                    applicant.firstname2,
                    applicant.middlename2,
                    applicant.extension,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Date of Birth</label>
                <p className="font-medium text-gray-800">
                  {applicant.dob2
                    ? new Date(applicant.dob2).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                      })
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Age</label>
                <p className="font-medium text-gray-800">
                  {applicant.age2 || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Sex</label>
                <p className="font-medium text-gray-800">
                  {applicant.sex2 || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Status</label>
                <p className="font-medium text-gray-800">
                  {applicant.status2 || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Contact</label>
                <p className="font-medium text-gray-800">
                  {applicant.contact2 || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Relationship</label>
                <p className="font-medium text-gray-800">
                  {applicant.relationship || "N/A"}
                </p>
              </div>
            </div>
          </div>
          {/* Other Details */}
          <div className="border-b pb-4 border-red-100">
            <h3 className="font-semibold text-xl text-red-700 mb-2">
              Other Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <label className="text-gray-500">Entered By</label>
                <p className="font-medium text-gray-800">
                  {applicant.entered_by || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Entered Date</label>
                <p className="font-medium text-gray-800">
                  {applicant.entered_date
                    ? new Date(applicant.entered_date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "2-digit",
                        }
                      )
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Date Accomplished</label>
                <p className="font-medium text-gray-800">
                  {applicant.date_accomplished
                    ? new Date(applicant.date_accomplished).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "2-digit",
                        }
                      )
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Interviewer</label>
                <p className="font-medium text-gray-800">
                  {applicant.interviewer || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">License Number</label>
                <p className="font-medium text-gray-800">
                  {applicant.license_number || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Application Status</label>
                <p className="font-medium text-gray-800">
                  {applicant.application_status || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Reason</label>
                <p className="font-medium text-gray-800">
                  {applicant.reason || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button
            onClick={onClose}
            className="bg-red-700 hover:bg-red-800 text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  );
}

export default function SearchPage() {
  const [form, setForm] = useState({
    lastname: "",
    firstname: "",
    middlename: "",
    extension: "",
    birthday: "",
  });
  const [loading, setLoading] = useState(false);
  const [tupad, setTupad] = useState<TupadApplicant[]>([]);
  const [doh, setDoh] = useState<DohApplicant[]>([]);
  const [dswd, setDswd] = useState<DswdApplicant[]>([]);
  const [voters, setVoters] = useState<VotersList[]>([]);
  const [searched, setSearched] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<
    TupadApplicant | DohApplicant | DswdApplicant | VotersList | null
  >(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const isFormEmpty = Object.values(form).every((value) => !value.trim());

    if (isFormEmpty) {
      setTupad([]);
      setDoh([]);
      setDswd([]);
      setVoters([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    const params = new URLSearchParams(form as any).toString();

    const [tupadRes, dohRes, dswdRes, votersRes] = await Promise.all([
      fetch(`/api/search/tupad?${params}`),
      fetch(`/api/search/doh?${params}`),
      fetch(`/api/search/dswd?${params}`),
      fetch(`/api/search/voters?${params}`),
    ]);

    setTupad(tupadRes.ok ? await tupadRes.json() : []);
    setDoh(dohRes.ok ? await dohRes.json() : []);
    setDswd(dswdRes.ok ? await dswdRes.json() : []);
    setVoters(votersRes.ok ? await votersRes.json() : []);
    setLoading(false);
  };

  const handleViewApplicant = (
    applicant: TupadApplicant | DohApplicant | DswdApplicant | VotersList
  ) => {
    setSelectedApplicant(applicant);
    setIsViewDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsViewDialogOpen(false);
    setSelectedApplicant(null);
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-700">
            Search Applicants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch}>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[150px] flex flex-col">
                <Label htmlFor="lastname">Last Name</Label>
                <Input
                  id="lastname"
                  name="lastname"
                  value={form.lastname}
                  onChange={handleChange}
                  placeholder="Enter last name"
                />
              </div>
              <div className="flex-1 min-w-[150px] flex flex-col">
                <Label htmlFor="firstname">First Name</Label>
                <Input
                  id="firstname"
                  name="firstname"
                  value={form.firstname}
                  onChange={handleChange}
                  placeholder="Enter first name"
                />
              </div>
              <div className="flex-1 min-w-[150px] flex flex-col">
                <Label htmlFor="middlename">Middle Name</Label>
                <Input
                  id="middlename"
                  name="middlename"
                  value={form.middlename}
                  onChange={handleChange}
                  placeholder="Enter middle name"
                />
              </div>
              <div className="flex-1 min-w-[120px] flex flex-col">
                <Label htmlFor="extension">Extension</Label>
                <Input
                  id="extension"
                  name="extension"
                  value={form.extension}
                  onChange={handleChange}
                  placeholder="Jr."
                />
              </div>
              <div className="flex-1 min-w-[150px] flex flex-col">
                <Label htmlFor="birthday">Birthday</Label>
                <Input
                  id="birthday"
                  name="birthday"
                  type="date"
                  value={form.birthday}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Button
                  type="submit"
                  className="bg-red-700 hover:bg-red-800 text-white whitespace-nowrap"
                  disabled={loading}
                >
                  {loading ? (
                    "Searching..."
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {searched && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-red-700">
              Voter's Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {voters.length === 0 ? (
              <div className="text-center text-gray-400">No records found</div>
            ) : (
              <div className="space-y-4">
                {voters.map((voter, index) => (
                  <Card
                    key={index}
                    className="p-4 border border-gray-200 shadow-sm rounded-xl"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {[
                          voter.voters_lastname + ",",
                          voter.voters_firstname,
                          voter.voters_middlename,
                          voter.voters_extension,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      </p>
                      <p className="text-sm text-gray-600">
                        Precinct:{" "}
                        <span className="font-medium">
                          {voter.precinct || "N/A"}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Barangay:{" "}
                        <span className="font-medium">
                          {voter.barangay || "N/A"}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Municipality:{" "}
                        <span className="font-medium">
                          {voter.municipality || "N/A"}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Province:{" "}
                        <span className="font-medium">
                          {voter.province || "N/A"}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Region:{" "}
                        <span className="font-medium">
                          {voter.region || "N/A"}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        District:{" "}
                        <span className="font-medium">
                          {voter.district || "N/A"}
                        </span>
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {searched && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-red-700">
                TUPAD Applicants
              </CardTitle>
              <div className="text-sm text-gray-600">Total: {tupad.length}</div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tupad.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-gray-400"
                        >
                          No records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      tupad.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleViewApplicant(a)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4 text-blue-500" />
                            </Button>
                          </TableCell>
                          <TableCell>
                            {[
                              a.lastname + ",",
                              a.firstname,
                              a.middlename,
                              a.extension,
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          </TableCell>
                          <TableCell>
                            {a.created_at
                              ? new Date(a.created_at).toLocaleDateString()
                              : ""}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-red-700">
                DOH Applicants
              </CardTitle>
              <div className="text-sm text-gray-600">Total: {doh.length}</div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doh.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-gray-400"
                        >
                          No records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      doh.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleViewApplicant(a)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4 text-blue-500" />
                            </Button>
                          </TableCell>
                          <TableCell>
                            {[
                              a.applicant_lastname + ",",
                              a.applicant_firstname,
                              a.applicant_middlename,
                              a.applicant_extension,
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          </TableCell>
                          <TableCell>
                            {a.date
                              ? new Date(a.date).toLocaleDateString()
                              : ""}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-red-700">
                DSWD Applicants
              </CardTitle>
              <div className="text-sm text-gray-600">Total: {dswd.length}</div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dswd.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-gray-400"
                        >
                          No records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      dswd.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleViewApplicant(a)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4 text-blue-500" />
                            </Button>
                          </TableCell>
                          <TableCell>
                            {[
                              a.lastname + ",",
                              a.firstname,
                              a.middlename,
                              a.extraname,
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          </TableCell>
                          <TableCell>
                            {a.entered_date
                              ? new Date(a.entered_date).toLocaleDateString()
                              : ""}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        {selectedApplicant && "created_at" in selectedApplicant && (
          <TupadViewDetails
            applicant={selectedApplicant as TupadApplicant}
            onClose={handleCloseDialog}
          />
        )}
        {selectedApplicant && "date" in selectedApplicant && (
          <DohViewDetails
            applicant={selectedApplicant as DohApplicant}
            onClose={handleCloseDialog}
          />
        )}
        {selectedApplicant && "entered_date" in selectedApplicant && (
          <DswdViewDetails
            applicant={selectedApplicant as DswdApplicant}
            onClose={handleCloseDialog}
          />
        )}
      </Dialog>
    </div>
  );
}
