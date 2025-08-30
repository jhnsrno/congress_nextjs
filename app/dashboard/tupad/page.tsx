//app/dashboard/tupad/page.tsx
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
  FileText,
  AlertCircle,
  Plus,
  Search,
  UserCheck,
  UserX,
  Eye,
  Trash2,
  Pencil,
  Lasso,
  Calendar,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useAuth } from "@/contexts/AuthContext";

interface TupadApplicant {
  id: number;
  firstname: string;
  middlename: string;
  lastname: string;
  extension: string;
  birthday: string;
  age: number;
  sex: string;
  civil_status: string;
  barangay: string;
  city_municipality: string;
  province: string;
  district: string;
  type_of_id: string;
  id_number: string;
  contact_number: string;
  bank_account_no: string;
  type_of_beneficiary: string;
  occupation: string;
  monthly_income: string;
  dependent_name: string;
  created_at: string;
}

type TupadFormData = Omit<TupadApplicant, "id" | "created_at">;

// Initial state for the form
const initialFormData: TupadFormData = {
  firstname: "",
  middlename: "",
  lastname: "",
  extension: "",
  birthday: "",
  age: 0,
  sex: "",
  civil_status: "",
  barangay: "",
  city_municipality: "",
  province: "BATANGAS",
  district: "3RD",
  type_of_id: "",
  id_number: "",
  contact_number: "",
  bank_account_no: "",
  type_of_beneficiary: "",
  occupation: "",
  monthly_income: "",
  dependent_name: "",
};

export default function TupadApplicantsPage() {
  const { user } = useAuth();
  const [applicants, setApplicants] = useState<TupadApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>(""); // New year filter state
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // State for Add/Edit Dialog
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingApplicant, setEditingApplicant] =
    useState<TupadApplicant | null>(null);
  const [form, setForm] = useState<TupadFormData>(initialFormData);
  const [formLoading, setFormLoading] = useState(false);

  // State for View Dialog
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] =
    useState<TupadApplicant | null>(null);

  // State for Delete Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [applicantToDelete, setApplicantToDelete] =
    useState<TupadApplicant | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const applicantsPerPage = 10;

  // Get unique years from applicants for the filter dropdown
  const getAvailableYears = () => {
    const years = applicants
      .map((a) => new Date(a.created_at).getFullYear())
      .filter((year) => !isNaN(year));
    return [...new Set(years)].sort((a, b) => b - a); // Sort descending (newest first)
  };

  // Fetch applicants from API
  const fetchApplicants = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tupad_applicants");
      if (!res.ok) throw new Error("Failed to fetch applicants");
      setApplicants(await res.json());
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
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  // Handle form submission for both Add and Edit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    setSuccess("");

    const method = editingApplicant ? "PUT" : "POST";
    const url = editingApplicant
      ? `/api/tupad_applicants/${editingApplicant.id}`
      : "/api/tupad_applicants";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
  const handleViewApplicant = (applicant: TupadApplicant) => {
    setSelectedApplicant(applicant);
    setIsViewDialogOpen(true);
  };

  // Open dialog for editing an applicant
  const handleEditApplicant = (applicant: TupadApplicant) => {
    setEditingApplicant(applicant);
    setForm({
      firstname: applicant.firstname,
      middlename: applicant.middlename,
      lastname: applicant.lastname,
      extension: applicant.extension,
      birthday: applicant.birthday,
      age: applicant.age,
      sex: applicant.sex,
      civil_status: applicant.civil_status,
      barangay: applicant.barangay,
      city_municipality: applicant.city_municipality,
      province: applicant.province,
      district: applicant.district,
      type_of_id: applicant.type_of_id,
      id_number: applicant.id_number,
      contact_number: applicant.contact_number,
      bank_account_no: applicant.bank_account_no,
      type_of_beneficiary: applicant.type_of_beneficiary,
      occupation: applicant.occupation,
      monthly_income: applicant.monthly_income,
      dependent_name: applicant.dependent_name,
    });
    setIsFormDialogOpen(true);
  };

  // Open dialog for deleting an applicant
  const handleDeleteApplicant = (applicant: TupadApplicant) => {
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
      const res = await fetch(`/api/tupad_applicants/${applicantToDelete.id}`, {
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
    // Text search filter
    const matchesSearch = [
      a.firstname,
      a.middlename,
      a.lastname,
      a.barangay,
      a.city_municipality,
      a.province,
      a.contact_number,
      a.id_number,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Year filter
    const matchesYear = selectedYear === "" || 
      new Date(a.created_at).getFullYear().toString() === selectedYear;

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

    // Case 1: Excel date serial number
    if (typeof value === "number") {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // Excel's base date
      const date = new Date(excelEpoch.getTime() + value * 86400000);
      return date.toISOString().split("T")[0];
    }

    // Case 2: Already a Date object
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value.toISOString().split("T")[0];
    }

    // Case 3: String format like "01-02-2025" or "1/2/2025"
    if (typeof value === "string") {
      const parts = value.trim().split(/[-/]/);
      if (parts.length === 3) {
        let [day, month, year] = parts;

        if (year.length === 4 && day.length <= 2 && month.length <= 2) {
          const d = parseInt(day, 10);
          const m = parseInt(month, 10) - 1; // months are 0-indexed in JS
          const y = parseInt(year, 10);

          const date = new Date(y, m, d);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split("T")[0];
          }
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
          .map((row: any[]) => ({
            firstname: row[1] || "",
            middlename: row[2] || "",
            lastname: row[3] || "",
            extension: row[4] || "",
            birthday: parseExcelDate(row[5]),
            barangay: row[6] || "",
            city_municipality: row[7] || "",
            province: row[8] || "",
            district: row[9] || "",
            type_of_id: row[10] || "",
            id_number: row[11] || "",
            contact_number: row[12] || "",
            bank_account_no: row[13] || "",
            type_of_beneficiary: row[14] || "",
            occupation: row[15] || "",
            sex: row[16] || "",
            civil_status: row[17] || "",
            age: parseInt(row[18]) || 0,
            monthly_income: parseFloat(row[19]) || 0,
            dependent_name: row[20] || "",
          }));

        const batchSize = 200;
        const total = newApplicants.length;

        for (let i = 0; i < total; i += batchSize) {
          const batch = newApplicants.slice(i, i + batchSize);

          const res = await fetch("/api/tupad_applicants", {
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
          <h1 className="text-3xl font-bold text-gray-800">Tupad Applicants</h1>
          <p className="text-gray-600">Manage Tupad applicants</p>
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
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-red-700">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      {[
                        {
                          id: "firstname",
                          label: "First Name",
                          required: true,
                        },
                        { id: "middlename", label: "Middle Name" },
                        { id: "lastname", label: "Last Name", required: true },
                        { id: "extension", label: "Extension" },
                        { id: "birthday", label: "Birthday", type: "date" },
                        {
                          id: "age",
                          label: "Age",
                          type: "number",
                          readOnly: true,
                        },
                        {
                          id: "sex",
                          label: "Sex",
                          type: "select",
                          options: ["Male", "Female"],
                        },
                        {
                          id: "civil_status",
                          label: "Civil Status",
                          type: "select",
                          options: [
                            "Single",
                            "Married",
                            "Widowed",
                            "Separated",
                            "Divorced",
                          ],
                        },
                      ].map((field) => (
                        <div key={field.id} className="space-y-1.5">
                          <Label
                            htmlFor={field.id}
                            className="text-sm text-gray-700"
                          >
                            {field.label}
                          </Label>

                          {field.type === "select" ? (
                            <select
                              id={field.id}
                              name={field.id}
                              value={
                                form[field.id as keyof TupadFormData] as any
                              }
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  [field.id]: e.target.value,
                                }))
                              }
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700"
                              required={field.required}
                            >
                              <option value="">Select {field.label}</option>
                              {field.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <Input
                              id={field.id}
                              name={field.id}
                              type={field.type || "text"}
                              value={
                                form[field.id as keyof TupadFormData] as any
                              }
                              onChange={
                                field.id === "birthday"
                                  ? (e) => {
                                      const birthday = e.target.value;
                                      const birthDate = new Date(birthday);
                                      const today = new Date();
                                      let age =
                                        today.getFullYear() -
                                        birthDate.getFullYear();
                                      const m =
                                        today.getMonth() - birthDate.getMonth();
                                      if (
                                        m < 0 ||
                                        (m === 0 &&
                                          today.getDate() < birthDate.getDate())
                                      ) {
                                        age--;
                                      }
                                      setForm((prev) => ({
                                        ...prev,
                                        birthday,
                                        age: isNaN(age) ? 0 : age,
                                      }));
                                    }
                                  : handleChange
                              }
                              readOnly={field.readOnly}
                              required={field.required}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-red-700">
                      Address
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      {[
                        { id: "barangay", label: "Barangay" },
                        { id: "city_municipality", label: "City/Municipality" },
                        { id: "province", label: "Province" },
                        { id: "district", label: "District", readOnly: true },
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
                            value={form[field.id as keyof TupadFormData] as any}
                            onChange={handleChange}
                            readOnly={field.readOnly}
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
                            value={form[field.id as keyof TupadFormData] as any}
                            onChange={handleChange}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Other Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-red-700">
                      Other Information
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      {[
                        {
                          id: "type_of_beneficiary",
                          label: "Type of Beneficiary",
                        },
                        { id: "occupation", label: "Occupation" },
                        { id: "monthly_income", label: "Monthly Income" },
                        { id: "dependent_name", label: "Dependent Name" },
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
                            value={form[field.id as keyof TupadFormData] as any}
                            onChange={handleChange}
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
          {user?.role === 'admin' && (
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
                  Upload .xlsx file with properly formatted TUPAD applicant
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
                    setCurrentPage(1); // Reset to first page on search
                  }}
                  className="max-w-sm"
                />
              </div>
            </div>
            
            {/* Year Filter Row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <Label htmlFor="year-filter" className="text-sm text-gray-600">
                    Filter by Year:
                  </Label>
                  <select
                    id="year-filter"
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setCurrentPage(1); // Reset to first page on filter change
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
                
                {/* Clear Filters Button */}
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
              
              {/* Active Filters Display */}
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
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Sex</TableHead>
                      <TableHead>Occupation</TableHead>
                      <TableHead>Monthly Income</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Year Created</TableHead>
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
                          {a.firstname} {a.middlename} {a.lastname}{" "}
                          {a.extension}
                        </TableCell>
                        <TableCell>
                          {a.barangay}, {a.city_municipality}, {a.province}
                        </TableCell>
                        <TableCell>{a.age}</TableCell>
                        <TableCell>{a.sex}</TableCell>
                        <TableCell>{a.occupation}</TableCell>
                        <TableCell>
                          {/* Format monthly_income as "Php 4,000.00" */}
                          {a.monthly_income
                            ? `Php ${Number(a.monthly_income).toLocaleString(
                                "en-PH",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}`
                            : ""}
                        </TableCell>
                        <TableCell>{a.contact_number}</TableCell>
                        <TableCell>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                            {new Date(a.created_at).getFullYear()}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination Controls */}
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
                Full details for {selectedApplicant?.firstname}{" "}
                {selectedApplicant?.lastname}
              </DialogDescription>
            </DialogHeader>

            {selectedApplicant && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="border-b pb-4 border-red-100">
                  <h3 className="font-semibold text-xl text-red-700 mb-2">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div>
                      <Label className="text-gray-500">Full Name</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.firstname}{" "}
                        {selectedApplicant.middlename}{" "}
                        {selectedApplicant.lastname}{" "}
                        {selectedApplicant.extension}
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
                        {selectedApplicant.age}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Sex</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.sex}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Civil Status</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.civil_status}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Contact Number</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.contact_number}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="border-b pb-4 border-red-100">
                  <h3 className="font-semibold text-xl text-red-700 mb-2">
                    Address
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div>
                      <Label className="text-gray-500">Barangay</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.barangay}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">City/Municipality</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.city_municipality}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Province</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.province}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">District</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.district}
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
                      <Label className="text-gray-500">Type of ID</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.type_of_id}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">ID Number</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.id_number}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Bank Account No.</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.bank_account_no}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">
                        Type of Beneficiary
                      </Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.type_of_beneficiary}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Occupation</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.occupation}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Monthly Income</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.monthly_income
                          ? `Php ${Number(
                              selectedApplicant.monthly_income
                            ).toLocaleString("en-PH", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Dependent Name</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.dependent_name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Date Created</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.created_at
                          ? new Date(
                              selectedApplicant.created_at
                            ).toLocaleDateString("en-US", {
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
                {applicantToDelete?.firstname} {applicantToDelete?.lastname}
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