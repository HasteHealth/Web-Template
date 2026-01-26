import { useEffect, useState } from "react";
import type { Route } from "./+types/home";
import type {
  AllergyIntolerance,
  Bundle,
  Patient,
} from "@haste-health/fhir-types/r4/types";

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

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function AllergyDisplay({
  allergies,
}: {
  allergies: Record<string, AllergyIntolerance[]>;
}) {
  return (
    <div className="p-4 border space-y-2">
      <div>
        <span className="text-xl underline">Allergies</span>
      </div>
      {Object.keys(allergies).map((category) => (
        <div key={category}>
          <div>
            <span className="text-lg underline">{capitalize(category)}</span>
          </div>
          <ul className="text-sm">
            {allergies[category].map((allergy) => {
              return <li key={allergy.id}>{allergy.code?.text}</li>;
            })}
          </ul>
        </div>
      ))}
    </div>
  );
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
          {
            request: {
              method: "GET",
              url: `Patient/${params.pid}/AllergyIntolerance`,
            },
          },
        ],
      } as Bundle)
      .then((bundle) => {
        setPatientData(bundle);
      });
  }, [params.pid]);

  const patient = patientData?.entry?.[0]?.resource as unknown as
    | Patient
    | undefined;

  const allergies: Record<string, AllergyIntolerance[]> = Object.groupBy(
    ((
      patientData?.entry?.[6]?.resource as unknown as Bundle | undefined
    )?.entry?.map((e) => e.resource) as unknown as AllergyIntolerance[]) ?? [],
    (a: AllergyIntolerance) => a.category?.[0] ?? "",
  );

  return (
    <main className="space-y-8">
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
              <span>{patient?.name?.[0]?.family} </span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <AllergyDisplay allergies={allergies} />
      </div>
    </main>
  );
}
