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
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { Eye } from "lucide-react";

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
  reason: string;
}

export default function DswdEncodedPage() {
  const [applicants, setApplicants] = useState<DswdEncoded[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] =
    useState<DswdEncoded | null>(null);

  const fetchApplicants = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/dswd_applicant/unclaimed");
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

  const handleViewApplicant = (applicant: DswdEncoded) => {
    setSelectedApplicant(applicant);
    setIsViewDialogOpen(true);
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
          <h1 className="text-3xl font-bold">DSWD Unclaimed Applicants</h1>
          <p className="text-gray-600">Manage Unclaimed DSWD records.</p>
        </div>
      </div>

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
                      <TableHead className="text-center">Action</TableHead>
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
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewApplicant(applicant)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 text-blue-500" />
                          </Button>
                        </TableCell>
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
                    Beneficiary Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div>
                      <Label className="text-gray-500">Beneficiary Name</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.firstname}{" "}
                        {selectedApplicant.middlename}{" "}
                        {selectedApplicant.lastname}{" "}
                        {selectedApplicant.extraname}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Birthday</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.dob ? new Date(selectedApplicant.dob).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "2-digit" }) : 'N/A'}
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
                      <Label className="text-gray-500">Beneficiary No.</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.beneficiary_no}
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
                      <Label className="text-gray-500">Region</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.region}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Province</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.province}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">City/Municipality</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.city}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Barangay</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.barangay}
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

                {/* Assistance & Status */}
                <div className="border-b pb-4 border-red-100">
                  <h3 className="font-semibold text-xl text-red-700 mb-2">
                    Assistance & Status
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div>
                      <Label className="text-gray-500">Date Accomplished</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.date_accomplished ? new Date(selectedApplicant.date_accomplished).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "2-digit" }) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Status</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.application_status}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Mode of Admission</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.mode_of_admission}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">
                        Type of Assistance
                      </Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.type_of_assistance1}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">
                        Mode of Assistance
                      </Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.mode_of_assistance}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Amount</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.amount1
                          ? `Php ${Number(
                              selectedApplicant.amount1
                            ).toLocaleString("en-PH", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">
                        Beneficiary Category
                      </Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.beneficiary_category}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Sub Category</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.sub_category}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Relationship</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.relationship}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Entered by</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.entered_by}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Interviewer</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.interviewer}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">License Number</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.license_number}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Reason</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.reason}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Representative Information */}
                <div className="border-b pb-4 border-red-100">
                  <h3 className="font-semibold text-xl text-red-700 mb-2">
                    Representative Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div>
                      <Label className="text-gray-500">
                        Representative Name
                      </Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.firstname2}{" "}
                        {selectedApplicant.middlename2}{" "}
                        {selectedApplicant.lastname2}{" "}
                        {selectedApplicant.extension}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Sex</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.sex2}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Status</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.status2}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Birthday</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.dob2 ? new Date(selectedApplicant.dob2).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "2-digit" }) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Age</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.age2}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Contact</Label>
                      <p className="font-medium text-gray-800">
                        {selectedApplicant.contact2}
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
    </div>
  );
}