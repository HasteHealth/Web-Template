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
    <main>
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
    </main>
  );
}
