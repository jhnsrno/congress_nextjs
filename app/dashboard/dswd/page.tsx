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
import { FileUp, FileText, Search, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";

// Updated interface to match dswd_encoded table
interface DswdEncoded {
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
}

export default function DswdEncodedPage() {
  const [applicants, setApplicants] = useState<DswdEncoded[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchApplicants = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/dswd_applicant");
      if (!response.ok) throw new Error("Failed to fetch data.");
      const data: DswdEncoded[] = await response.json();
      setApplicants(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

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
            entered_date: parseExcelDate(row[0]),
            entered_by: row[1] || "",
            beneficiary_no: row[2] || "",
            date_accomplished: parseExcelDate(row[3]),
            region: row[4] || "",
            province: row[5] || "",
            city: row[6] || "",
            barangay: row[7] || "",
            district: row[8] || "",
            lastname: row[9] || "",
            firstname: row[10] || "",
            middlename: row[11] || "",
            extraname: row[12] || "",
            sex: row[13] || "",
            civil_status: row[14] || "",
            dob: parseExcelDate(row[15]),
            age: parseInt(row[16]) || 0,
            mode_of_admission: row[17] || "",
            type_of_assistance1: row[18] || "",
            amount1: row[19] || "",
            beneficiary_category: row[30] || "",
            sub_category: row[31] || "",
            relationship: row[32] || "",
            lastname2: row[33] || "",
            firstname2: row[34] || "",
            middlename2: row[35] || "",
            extension: row[36] || "",
            sex2: row[37] || "",
            status2: row[38] || "",
            dob2: parseExcelDate(row[39]),
            age2: parseInt(row[40]) || 0,
            contact2: row[41] || "",
            mode_of_assistance: row[42] || "",
            interviewer: row[43] || "",
            license_number: row[44] || "",
          }));

        const batchSize = 200;
        const total = newApplicants.length;

        for (let i = 0; i < total; i += batchSize) {
          const batch = newApplicants.slice(i, i + batchSize);

          const res = await fetch("/api/dswd_applicant", {
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

  const filteredApplicants = applicants.filter((a) =>
    [
      a.firstname,
      a.lastname,
      a.middlename,
      a.barangay,
      a.city,
      a.contact2,
      a.beneficiary_no,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const [currentPage, setCurrentPage] = useState(1);
  const applicantsPerPage = 10;
  const totalPages = Math.ceil(filteredApplicants.length / applicantsPerPage);
  const paginatedApplicants = filteredApplicants.slice(
    (currentPage - 1) * applicantsPerPage,
    currentPage * applicantsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">DSWD Encoded Applicants</h1>
          <p className="text-gray-600">Manage uploaded DSWD records.</p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
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
                Upload .xlsx file with properly formatted DSWD applicant data.
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
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <FileText className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-700">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Applicants ({filteredApplicants.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="max-w-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : paginatedApplicants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No data found.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Last Name</TableHead>
                      <TableHead className="text-center">First Name</TableHead>
                      <TableHead className="text-center">Middle Name</TableHead>
                      <TableHead className="text-center">Sex</TableHead>
                      <TableHead className="text-center">
                        Mobile Number
                      </TableHead>
                      <TableHead className="text-center">Address</TableHead>
                      <TableHead className="text-center">
                        Type of Assistance
                      </TableHead>
                      <TableHead className="text-center">Amount</TableHead>
                      <TableHead className="text-center">
                        Beneficiary Relationship
                      </TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedApplicants.map((applicant) => (
                      <TableRow key={applicant.id}>
                        <TableCell className="text-center">
                          {applicant.lastname}
                        </TableCell>
                        <TableCell className="text-center">
                          {applicant.firstname}
                        </TableCell>
                        <TableCell className="text-center">
                          {applicant.middlename}
                        </TableCell>
                        <TableCell className="text-center">
                          {applicant.sex}
                        </TableCell>
                        <TableCell className="text-center">
                          {applicant.contact2}
                        </TableCell>
                        <TableCell className="text-center">
                          {applicant.barangay}, {applicant.city},{" "}
                          {applicant.province}
                        </TableCell>
                        <TableCell className="text-center">
                          {applicant.type_of_assistance1}
                        </TableCell>
                        <TableCell className="text-center">
                          {`Php ${Number(applicant.amount1).toLocaleString(
                            "en-PH",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}`}
                        </TableCell>
                        <TableCell className="text-center">
                          {applicant.relationship}
                        </TableCell>
                        <TableCell className="text-center">
                          {applicant.application_status}
                        </TableCell>
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
    </div>
  );
}
