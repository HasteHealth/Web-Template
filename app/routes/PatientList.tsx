import { useNavigate } from "react-router";
import type { Route } from "./+types/home";

import {
  FHIRGenerativeSearchTable,
  useHasteHealth,
} from "@haste-health/components";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Haste Health Web App" },
    { name: "description", content: "Example web app for Haste Health" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const hasteHealth = useHasteHealth();

  return (
    <main className="min-h-screen bg-linear-to-br from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-orange-900 mb-2">
                Patient Directory
              </h1>
              <p className="text-orange-600">
                Search and select a patient to view their medical record
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-orange-800">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>FHIR R4 Patient Resources</span>
            </div>
          </div>
        </div>

        {/* Search Table Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
            <div className="flex items-center space-x-3">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-orange-50">
                Search Patients
              </h2>
            </div>
            <p className="text-orange-100 text-sm mt-1">
              Search by name, identifier, address, phone, or gender
            </p>
          </div>

          <div className="p-6">
            <FHIRGenerativeSearchTable
              client={hasteHealth.client}
              fhirVersion={"4.0"}
              resourceType={"Patient"}
              parameters={[
                "given",
                "family",
                "identifier",
                "address",
                "phone",
                "gender",
              ]}
              onRowClick={(row: any) => {
                navigate(`/patient/${row.id}`);
              }}
            />
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-orange-950 mb-1">
                How to use
              </h3>
              <ul className="text-sm text-orange-900 space-y-1">
                <li>
                  • Use the search box to find patients by name, ID, or other
                  attributes
                </li>
                <li>• Click on any row to view the complete patient chart</li>
                <li>• Results are fetched in real-time from the FHIR server</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
