import type { Route } from "./+types/home";

import {
  Button,
  FHIRCodeEditable,
  FHIRGenerativeSearchTable,
  FHIRReferenceEditable,
  FHIRStringEditable,
  Modal,
  Toaster,
  useHasteHealth,
} from "@haste-health/components";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Haste Health Web App" },
    { name: "description", content: "Example web app for Haste Health" },
  ];
}

export default function Home() {
  const hasteHealth = useHasteHealth();

  return (
    <main>
      <FHIRGenerativeSearchTable
        client={hasteHealth.client}
        fhirVersion={"4.0"}
        resourceType={"Patient"}
      />
    </main>
  );
}
