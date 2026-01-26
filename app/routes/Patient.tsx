import { useEffect, useState } from "react";
import type { Route } from "./+types/home";
import type { Bundle, Patient } from "@haste-health/fhir-types/r4/types";

import {
  // FHIRGenerativeSearchTable,
  useHasteHealth,
} from "@haste-health/components";
import * as fp from "@haste-health/fhirpath";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Haste Health Web App" },
    { name: "description", content: "Example web app for Haste Health" },
  ];
}

export default function Home({ params }: Route.ComponentProps) {
  const hasteHealth = useHasteHealth();
  const [patientData, setPatientData] = useState<Bundle | null>(null);

  useEffect(() => {
    hasteHealth.client
      .batch({}, "4.0", {
        resourceType: "Bundle",
        type: "batch",
        entry: [
          {
            request: {
              method: "GET",
              url: `Patient/${params.pid}`,
            },
          },
          {
            request: {
              method: "GET",
              url: `Patient/${params.pid}/Observation`,
            },
          },
          {
            request: {
              method: "GET",
              url: `Patient/${params.pid}/Encounter`,
            },
          },
          {
            request: {
              method: "GET",
              url: `Patient/${params.pid}/Condition`,
            },
          },
          {
            request: {
              method: "GET",
              url: `Patient/${params.pid}/MedicationRequest`,
            },
          },
          {
            request: {
              method: "GET",
              url: `Patient/${params.pid}/Medication`,
            },
          },
        ],
      } as Bundle)
      .then((bundle) => {
        setPatientData(bundle);
      });
  }, [params.pid]);

  let patient = patientData?.entry?.[0]?.resource as unknown as
    | Patient
    | undefined;

  return (
    <main>
      <div className="border p-4 shadow-sm ">
        <div className="flex space-x-4">
          <div>
            <div className="font-light text-sm underline">First Name</div>
            <div>
              <span>{patient?.name?.[0]?.given?.join(" ")} </span>
            </div>
          </div>
          <div>
            <div className="font-light text-sm underline">Last Name</div>
            <div>
              <span>{patient?.name?.[0]?.family}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
