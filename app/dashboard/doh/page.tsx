"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileUp,
  AlertCircle,
  Plus,
  Search,
  UserCheck,
  UserX,
  Eye,
  Trash2,
  Pencil,
  Calendar,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useAuth } from "@/contexts/AuthContext";

interface DohApplicant {
  id: number;
  date: string;
  hospital: string;
  patient_lastname: string;
  patient_firstname: string;
  patient_middlename: string;
  patient_extension: string;
  birthday: string;
  age: number;
  address: string;
  city: string;
  province: string;
  diagnosis: string;
  assistance_type: string;
  recommended_amount: string;
  applicant_lastname: string;
  applicant_firstname: string;
  applicant_middlename: string;
  applicant_extension: string;
  relationship: string;
  contact_number: string;
  type_of_id: string;
  id_number: string;
  bank_account_no: string;
}

type DohFormData = Omit<DohApplicant, "id" | "age"> & { age: string };

// Initial state for the form
const initialFormData: DohFormData = {
  date: "",
  hospital: "",
  patient_lastname: "",
  patient_firstname: "",
  patient_middlename: "",
  patient_extension: "",
  birthday: "",
  age: "",
  address: "",
  city: "",
  province: "BATANGAS",
  diagnosis: "",
  assistance_type: "",
  recommended_amount: "",
  applicant_lastname: "",
  applicant_firstname: "",
  applicant_middlename: "",
  applicant_extension: "",
  relationship: "",
  contact_number: "",
  type_of_id: "",
  id_number: "",
  bank_account_no: "",
};

export default function DohApplicantsPage() {
  const { user } = useAuth();
  const [applicants, setApplicants] = useState<DohApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // State for Add/Edit Dialog
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState<DohApplicant | null>(
    null
  );
  const [form, setForm] = useState<DohFormData>(initialFormData);
  const [formLoading, setFormLoading] = useState(false);

  // State for View Dialog
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] =
    useState<DohApplicant | null>(null);

  // State for Delete Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [applicantToDelete, setApplicantToDelete] =
    useState<DohApplicant | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const applicantsPerPage = 10;

  // Calculate age from birthday
  const calculateAge = (birthday: string): number => {
    if (!birthday) return 0;
    const birthDate = new Date(birthday);
    if (isNaN(birthDate.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Get unique years from applicants for the filter dropdown
  const getAvailableYears = () => {
    const years = applicants
      .map((a) => new Date(a.date).getFullYear())
      .filter((year) => !isNaN(year));
    return [...new Set(years)].sort((a, b) => b - a);
  };

  // Fetch applicants from API
  const fetchApplicants = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/doh_applicants");
      if (!res.ok) throw new Error("Failed to fetch applicants");
      const data = await res.json();
      // Calculate age for each applicant
      const updatedData = data.map((applicant: DohApplicant) => ({
        ...applicant,
        age: calculateAge(applicant.birthday),
      }));
      setApplicants(updatedData);
    } catch (err) {
      setError("Failed to load applicants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const newForm = { ...prev, [name]: value };
      if (name === "birthday") {
        newForm.age = calculateAge(value).toString();
      }
      return newForm;
    });
  };

  // Handle form submission for both Add and Edit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    setSuccess("");

    const payload = {
      ...form,
      age: parseInt(form.age) || calculateAge(form.birthday),
    };

    const method = editingApplicant ? "PUT" : "POST";
    const url = editingApplicant
      ? `/api/doh_applicants/${editingApplicant.id}`
      : "/api/doh_applicants";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error ||
            `Failed to ${editingApplicant ? "update" : "add"} applicant`
        );
      }

      setSuccess(
        `Applicant ${editingApplicant ? "updated" : "added"} successfully`
      );
      setIsFormDialogOpen(false);
      setForm(initialFormData);
      setEditingApplicant(null);
      fetchApplicants();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${editingApplicant ? "update" : "add"} applicant`
      );
    } finally {
      setFormLoading(false);
    }
  };

  // Open dialog for viewing an applicant's details
  const handleViewApplicant = (applicant: DohApplicant) => {
    setSelectedApplicant(applicant);
    setIsViewDialogOpen(true);
  };

  // Open dialog for editing an applicant
  const handleEditApplicant = (applicant: DohApplicant) => {
    setEditingApplicant(applicant);
    setForm({
      date: applicant.date,
      hospital: applicant.hospital,
      patient_lastname: applicant.patient_lastname,
      patient_firstname: applicant.patient_firstname,
      patient_middlename: applicant.patient_middlename,
      patient_extension: applicant.patient_extension,
      birthday: applicant.birthday,
      age: applicant.age.toString(),
      address: applicant.address,
      city: applicant.city,
      province: applicant.province,
      diagnosis: applicant.diagnosis,
      assistance_type: applicant.assistance_type,
      recommended_amount: applicant.recommended_amount,
      applicant_lastname: applicant.applicant_lastname,
      applicant_firstname: applicant.applicant_firstname,
      applicant_middlename: applicant.applicant_middlename,
      applicant_extension: applicant.applicant_extension,
      relationship: applicant.relationship,
      contact_number: applicant.contact_number,
      type_of_id: applicant.type_of_id,
      id_number: applicant.id_number,
      bank_account_no: applicant.bank_account_no,
    });
    setIsFormDialogOpen(true);
  };

  // Open dialog for deleting an applicant
  const handleDeleteApplicant = (applicant: DohApplicant) => {
    setApplicantToDelete(applicant);
    setIsDeleteDialogOpen(true);
  };

  // Perform the actual deletion
  const confirmDelete = async () => {
    if (!applicantToDelete) return;

    setError("");
    setSuccess("");
    setFormLoading(true);

    try {
      const res = await fetch(`/api/doh_applicants/${applicantToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete applicant");
      }

      setSuccess("Applicant deleted successfully");
      setIsDeleteDialogOpen(false);
      setApplicantToDelete(null);
      fetchApplicants();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete applicant"
      );
    } finally {
      setFormLoading(false);
    }
  };

  // Filter and paginate with year filter
  const filteredApplicants = applicants.filter((a) => {
    const matchesSearch = [
      a.date,
      a.hospital,
      a.patient_lastname,
      a.patient_firstname,
      a.patient_middlename,
      a.patient_extension,
      a.birthday,
      a.age,
      a.address,
      a.city,
      a.province,
      a.diagnosis,
      a.assistance_type,
      a.recommended_amount,
      a.applicant_lastname,
      a.applicant_firstname,
      a.applicant_middlename,
      a.applicant_extension,
      a.relationship,
      a.contact_number,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesYear =
      selectedYear === "" ||
      new Date(a.date).getFullYear().toString() === selectedYear;

    return matchesSearch && matchesYear;
  });

  const totalPages = Math.ceil(filteredApplicants.length / applicantsPerPage);
  const paginatedApplicants = filteredApplicants.slice(
    (currentPage - 1) * applicantsPerPage,
    currentPage * applicantsPerPage
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setError("");
    setSuccess("");
  };

  const parseExcelDate = (value: any): string | null => {
    if (!value) return null;

    if (typeof value === "number") {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const date = new Date(excelEpoch.getTime() + value * 86400000);
      return date.toISOString().split("T")[0];
    }

    if (value instanceof Date && !isNaN(value.getTime())) {
      return value.toISOString().split("T")[0];
    }

    if (typeof value === "string") {
      const parts = value.trim().split(/[-/]/);
      if (parts.length === 3) {
        let [month, day, year] = parts;
        if (year.length === 2) year = `20${year}`;
        const date = new Date(`${year}-${month}-${day}`);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split("T")[0];
        }
      }
    }

    return null;
  };

  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUploadToDatabase = async () => {
    if (!selectedFile) {
      setError("Please select an Excel file to upload.");
      return;
    }

    setFormLoading(true);
    setError("");
    setSuccess("");
    setUploadProgress(0);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
        }) as any[][];

        if (rawData.length < 2) {
          setError("Invalid Excel file format.");
          setFormLoading(false);
          return;
        }

        const newApplicants = rawData
          .slice(1)
          .filter((row) =>
            row.some((cell) => cell !== null && String(cell).trim() !== "")
          )
          .map((row: any[]) => {
            return {
              date: parseExcelDate(row[0]) || "",
              hospital: row[2] || "",
              patient_lastname: row[3] || "",
              patient_firstname: row[4] || "",
              patient_middlename: row[5] || "",
              patient_extension: row[6] || "",
              birthday: parseExcelDate(row[7]) || "",
              age: row[8] || "",
              address: row[9] || "",
              city: row[10] || "",
              province: row[11] || "",
              diagnosis: row[12] || "",
              assistance_type: row[13] || "",
              recommended_amount: row[14] || "",
              applicant_lastname: row[15] || "",
              applicant_firstname: row[16] || "",
              applicant_middlename: row[17] || "",
              applicant_extension: row[18] || "",
              relationship: row[19] || "",
              contact_number: row[20] || "",
            };
          });

        const batchSize = 200;
        const total = newApplicants.length;

        for (let i = 0; i < total; i += batchSize) {
          const batch = newApplicants.slice(i, i + batchSize);

          const res = await fetch("/api/doh_applicants", {
            method: "POST",
            body: (() => {
              const formData = new FormData();
              formData.append("json", JSON.stringify(batch));
              return formData;
            })(),
          });

          if (!res.ok) {
            const response = await res.json();
            throw new Error(response.error || "Batch upload failed.");
          }

          setUploadProgress(Math.round(((i + batch.length) / total) * 100));
        }

        setFormLoading(false);
        setSuccess(`Successfully uploaded ${total} rows`);
        setIsUploadDialogOpen(false);
        setSelectedFile(null);
        setUploadProgress(0);
        fetchApplicants();
      };

      reader.readAsArrayBuffer(selectedFile);
    } catch (err: any) {
      setFormLoading(false);
      setError(err.message);
    }
  };

  // Reset filters function
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedYear("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Doh Applicants</h1>
          <p className="text-gray-600">Manage Doh applicants</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-red-700 hover:bg-red-800 mb-0"
                onClick={() => {
                  setIsFormDialogOpen(true);
                  setEditingApplicant(null);
                  setForm(initialFormData);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Applicant
              </Button>
            </DialogTrigger>
            <DialogContent
              className="w-[600px] h-[80vh] max-w-full max-h-[90vh] p-0 rounded-xl border border-gray-200 bg-white shadow-lg"
              style={{
                width: "600px",
                height: "80vh",
                maxWidth: "100vw",
                maxHeight: "90vh",
                padding: 0,
                overflow: "hidden",
              }}
            >
              <div className="h-full w-full overflow-y-auto p-6 space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-red-700">
                    {editingApplicant ? "Edit Applicant" : "Add Applicant"}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-600">
                    Fill out the applicant information.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmitForm} className="space-y-8">
                  {/* Hospital & Case Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-red-700">
                      Hospital & Case Details
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      {[
                        { id: "date", label: "Date", type: "date" },
                        { id: "hospital", label: "Hospital" },
                      ].map((field) => (
                        <div key={field.id} className="space-y-1.5">
                          <Label
                            htmlFor={field.id}
                            className="text-sm text-gray-700"
                          >
                            {field.label}
                          </Label>
                          <Input
                            id={field.id}
                            name={field.id}
                            type={field.type || "text"}
                            value={form[field.id as keyof DohFormData]}
                            onChange={handleChange}
                            required={
                              field.id === "date" || field.id === "hospital"
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Patient Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-red-700">
                      Patient Information
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      {[
                        { id: "patient_lastname", label: "Last Name" },
                        { id: "patient_firstname", label: "First Name" },
                        { id: "patient_middlename", label: "Middle Name" },
                        { id: "patient_extension", label: "Extension" },
                        { id: "birthday", label: "Birthday", type: "date" },
                        {
                          id: "age",
                          label: "Age",
                          type: "number",
                          readOnly: true,
                        },
                        { id: "address", label: "Barangay" },
                        { id: "city", label: "City" },
                        { id: "province", label: "Province" },
                        { id: "diagnosis", label: "Diagnosis" },
                      ].map((field) => (
                        <div key={field.id} className="space-y-1.5">
                          <Label
                            htmlFor={field.id}
                            className="text-sm text-gray-700"
                          >
                            {field.label}
                          </Label>
                          <Input
                            id={field.id}
                            name={field.id}
                            type={field.type || "text"}
                            value={form[field.id as keyof DohFormData]}
                            onChange={handleChange}
                            readOnly={field.readOnly}
                            required={
                              field.id === "patient_lastname" ||
                              field.id === "patient_firstname" ||
                              field.id === "birthday" ||
                              field.id === "address" ||
                              field.id === "city" ||
                              field.id === "province" ||
                              field.id === "diagnosis"
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Identification & Contact */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-red-700">
                      Identification & Contact
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      {[
                        { id: "type_of_id", label: "Type of ID" },
                        { id: "id_number", label: "ID Number" },
                        { id: "contact_number", label: "Contact Number" },
                        { id: "bank_account_no", label: "Bank Account No." },
                      ].map((field) => (
                        <div key={field.id} className="space-y-1.5">
                          <Label
                            htmlFor={field.id}
                            className="text-sm text-gray-700"
                          >
                            {field.label}
                          </Label>
                          <Input
                            id={field.id}
                            name={field.id}
                            value={form[field.id as keyof DohFormData]}
                            onChange={handleChange}
                            required={field.id === "contact_number"}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assistance Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-red-700">
                      Assistance Information
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      {[
                        { id: "assistance_type", label: "Type of Assistance" },
                        { id: "recommended_amount", label: "Amount" },
                      ].map((field) => (
                        <div key={field.id} className="space-y-1.5">
                          <Label
                            htmlFor={field.id}
                            className="text-sm text-gray-700"
                          >
                            {field.label}
                          </Label>
                          <Input
                            id={field.id}
                            name={field.id}
                            value={form[field.id as keyof DohFormData]}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Applicant Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-red-700">
                      Applicant Information
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      {[
                        { id: "applicant_lastname", label: "Last Name" },
                        { id: "applicant_firstname", label: "First Name" },
                        { id: "applicant_middlename", label: "Middle Name" },
                        { id: "applicant_extension", label: "Extension" },
                        {
                          id: "relationship",
                          label: "Relationship to Patient",
                        },
                      ].map((field) => (
                        <div key={field.id} className="space-y-1.5">
                          <Label
                            htmlFor={field.id}
                            className="text-sm text-gray-700"
                          >
                            {field.label}
                          </Label>
                          <Input
                            id={field.id}
                            name={field.id}
                            value={form[field.id as keyof DohFormData]}
                            onChange={handleChange}
                            required={
                              field.id === "applicant_lastname" ||
                              field.id === "applicant_firstname" ||
                              field.id === "relationship"
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsFormDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={formLoading}
                      className="bg-red-700 hover:bg-red-800 text-white"
                    >
                      {formLoading
                        ? editingApplicant
                          ? "Updating..."
                          : "Saving..."
                        : editingApplicant
                        ? "Update Applicant"
                        : "Add Applicant"}
                    </Button>
                  </DialogFooter>
                </form>
              </div>
            </DialogContent>
          </Dialog>
          {user?.role === "admin" && (
            <Dialog
              open={isUploadDialogOpen}
              onOpenChange={setIsUploadDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-red-700 hover:bg-red-800">
                  <FileUp className="w-4 h-4 mr-2" />
                  Upload Excel file
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Excel</DialogTitle>
                  <DialogDescription>
                    Upload .xlsx file with properly formatted Doh applicant
                    data.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Label htmlFor="file">Excel File</Label>
                  <Input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsUploadDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUploadToDatabase}
                    disabled={formLoading || !selectedFile}
                  >
                    {formLoading ? "Uploading..." : "Upload to Database"}
                  </Button>
                </DialogFooter>

                {uploadProgress > 0 && (
                  <div className="w-full mt-4">
                    <div className="h-2 bg-gray-200 rounded">
                      <div
                        className="h-2 bg-green-600 rounded"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm mt-1 text-center">
                      {uploadProgress}% uploaded
                    </p>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <UserCheck className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-700">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Applicants ({filteredApplicants.length})</CardTitle>
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search applicants..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="max-w-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <Label
                    htmlFor="year-filter"
                    className="text-sm text-gray-600"
                  >
                    Filter by Year:
                  </Label>
                  <select
                    id="year-filter"
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 min-w-[120px]"
                  >
                    <option value="">All Years</option>
                    {getAvailableYears().map((year) => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {(searchTerm || selectedYear) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {selectedYear && (
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md">
                    Year: {selectedYear}
                  </span>
                )}
                {searchTerm && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
                    Search: "{searchTerm}"
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-b-2 border-red-700 mx-auto rounded-full" />
              <p className="text-gray-600 mt-2">Loading applicants...</p>
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className="text-center py-8">
              <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm || selectedYear
                  ? "No applicants found matching the current filters"
                  : "No applicants found"}
              </p>
              {(searchTerm || selectedYear) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="mt-2"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Actions</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Diagnosis</TableHead>
                      <TableHead>Type of Assistance</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Contact Number</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedApplicants.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="text-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewApplicant(a)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditApplicant(a)}
                            title="Edit Applicant"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteApplicant(a)}
                            title="Delete Applicant"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                        <TableCell>
                          {a.date
                            ? new Date(a.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "2-digit",
                              })
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {a.patient_lastname} {a.patient_firstname}{" "}
                          {a.patient_middlename} {a.patient_extension}
                        </TableCell>
                        <TableCell>{a.age}</TableCell>
                        <TableCell>
                          {a.address}, {a.city}, {a.province}
                        </TableCell>
                        <TableCell>{a.diagnosis}</TableCell>
                        <TableCell>{a.assistance_type}</TableCell>
                        <TableCell>
                          {a.recommended_amount
                            ? `Php ${Number(
                                a.recommended_amount
                              ).toLocaleString("en-PH", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            : "N/A"}
                        </TableCell>
                        <TableCell>{a.contact_number}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Applicant Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
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
                Applicant Details
              </DialogTitle>
              <DialogDescription className="text-md text-gray-600">
                Full details for {selectedApplicant?.applicant_firstname}{" "}
                {selectedApplicant?.applicant_lastname}
              </DialogDescription>
            </DialogHeader>

            {selectedApplicant && (
              <div className="space-y-6">
                {/* Hospital & Case Details */}
                <div className="border-b pb-4 border-red-100">
                  <h3 className="font-semibold text-xl text-red-700 mb-2">
                    Hospital & Case Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div>
                      <Label className="text-gray-500">Date</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.date
                          ? new Date(selectedApplicant.date).toLocaleDateString(
                              "en-US",
                              { year: "numeric", month: "long", day: "2-digit" }
                            )
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Hospital</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.hospital || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Patient Information */}
                <div className="border-b pb-4 border-red-100">
                  <h3 className="font-semibold text-xl text-red-700 mb-2">
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div>
                      <Label className="text-gray-500">Full Name</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.patient_firstname}{" "}
                        {selectedApplicant.patient_middlename}{" "}
                        {selectedApplicant.patient_lastname}{" "}
                        {selectedApplicant.patient_extension}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Birthday</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.birthday
                          ? new Date(
                              selectedApplicant.birthday
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "2-digit",
                            })
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Age</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.age || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Address</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.address || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">City</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.city || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Province</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.province || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Diagnosis</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.diagnosis || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Identification & Contact */}
                <div className="border-b pb-4 border-red-100">
                  <h3 className="font-semibold text-xl text-red-700 mb-2">
                    Identification & Contact
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div>
                      <Label className="text-gray-500">Type of ID</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.type_of_id || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">ID Number</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.id_number || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Contact Number</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.contact_number || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Bank Account No.</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.bank_account_no || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Assistance Information */}
                <div className="border-b pb-4 border-red-100">
                  <h3 className="font-semibold text-xl text-red-700 mb-2">
                    Assistance Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div>
                      <Label className="text-gray-500">
                        Type of Assistance
                      </Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.assistance_type || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Amount</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.recommended_amount
                          ? `Php ${Number(
                              selectedApplicant.recommended_amount
                            ).toLocaleString("en-PH", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Applicant Information */}
                <div className="border-b pb-4 border-red-100">
                  <h3 className="font-semibold text-xl text-red-700 mb-2">
                    Applicant Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div>
                      <Label className="text-gray-500">Full Name</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.applicant_firstname}{" "}
                        {selectedApplicant.applicant_middlename}{" "}
                        {selectedApplicant.applicant_lastname}{" "}
                        {selectedApplicant.applicant_extension}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">
                        Relationship to Patient
                      </Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.relationship || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Contact Number</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.contact_number || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="mt-6">
              <Button
                onClick={() => setIsViewDialogOpen(false)}
                className="bg-red-700 hover:bg-red-800 text-white"
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-700">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the applicant{" "}
              <span className="font-semibold">
                {applicantToDelete?.applicant_firstname}{" "}
                {applicantToDelete?.applicant_lastname}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={formLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {formLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
