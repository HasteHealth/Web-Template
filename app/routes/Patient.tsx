import { useEffect, useState } from "react";
import type { Route } from "./+types/home";
import type {
  AllergyIntolerance,
  Bundle,
  code,
  Condition,
  Encounter,
  MedicationRequest,
  Observation,
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
  allergies: Record<code, AllergyIntolerance[] | undefined>;
}) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCriticalityColor = (criticality?: string) => {
    switch (criticality) {
      case "high":
        return "text-red-700 font-bold";
      case "low":
        return "text-yellow-700";
      default:
        return "text-gray-700";
    }
  };

  const getCriticalityBadge = (criticality?: string) => {
    switch (criticality) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300";
      case "low":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getVerificationStatusColor = (status?: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "unconfirmed":
        return "bg-yellow-100 text-yellow-800";
      case "refuted":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getClinicalStatusColor = (status?: string) => {
    if (status === "active") return "text-red-600 font-semibold";
    if (status === "inactive") return "text-gray-500";
    return "text-gray-700";
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <div className="mb-4 pb-2 border-b">
        <h3 className="text-xl font-semibold text-gray-800">
          Allergies & Intolerances
        </h3>
      </div>
      {Object.keys(allergies).length === 0 ? (
        <div className="text-gray-500 italic">
          No known allergies documented
        </div>
      ) : (
        Object.keys(allergies).map((category) => (
          <div key={category} className="mb-6 last:mb-0">
            <div className="mb-3">
              <span className="text-lg font-semibold text-gray-700 border-b-2 border-blue-500 pb-1">
                {capitalize(category)} Allergies
              </span>
            </div>
            <div className="space-y-3">
              {(allergies[category as code] ?? []).map((allergy) => {
                const clinicalStatus =
                  allergy.clinicalStatus?.coding?.[0]?.code;
                const verificationStatus =
                  allergy.verificationStatus?.coding?.[0]?.code;
                const criticality = allergy.criticality;

                return (
                  <div
                    key={allergy.id}
                    className={`p-3 rounded border-l-4 ${
                      criticality === "high"
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`font-semibold text-base ${getCriticalityColor(criticality)}`}
                          >
                            {allergy.code?.text ??
                              allergy.code?.coding?.[0]?.display ??
                              "Unknown Allergen"}
                          </span>
                          {criticality && (
                            <span
                              className={`px-2 py-0.5 text-xs rounded border ${getCriticalityBadge(criticality)}`}
                            >
                              {criticality.toUpperCase()} RISK
                            </span>
                          )}
                        </div>
                        {allergy.code?.coding?.[0]?.code && (
                          <div className="text-xs text-gray-500">
                            Code: {allergy.code.coding[0].code} (
                            {allergy.code.coding[0].system?.split("/").pop()})
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {clinicalStatus && (
                          <span
                            className={`px-2 py-0.5 text-xs rounded ${getClinicalStatusColor(clinicalStatus)}`}
                          >
                            {clinicalStatus.toUpperCase()}
                          </span>
                        )}
                        {verificationStatus && (
                          <span
                            className={`px-2 py-0.5 text-xs rounded ${getVerificationStatusColor(verificationStatus)}`}
                          >
                            {verificationStatus}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reaction Information */}
                    {allergy.reaction && allergy.reaction.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {allergy.reaction.map((reaction, idx) => (
                          <div
                            key={idx}
                            className="pl-3 border-l-2 border-gray-300"
                          >
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">
                                Reaction:
                              </span>
                              <div className="ml-2 mt-1">
                                {reaction.manifestation?.map(
                                  (manifestation, mIdx) => (
                                    <div
                                      key={mIdx}
                                      className="flex items-center gap-2"
                                    >
                                      <span className="text-gray-800">
                                        •{" "}
                                        {manifestation.text ??
                                          manifestation.coding?.[0]?.display ??
                                          "Unknown manifestation"}
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                            {reaction.severity && (
                              <div className="text-sm mt-1">
                                <span className="font-medium text-gray-700">
                                  Severity:
                                </span>{" "}
                                <span
                                  className={
                                    reaction.severity === "severe"
                                      ? "text-red-600 font-semibold"
                                      : ""
                                  }
                                >
                                  {capitalize(reaction.severity)}
                                </span>
                              </div>
                            )}
                            {reaction.exposureRoute && (
                              <div className="text-sm mt-1">
                                <span className="font-medium text-gray-700">
                                  Route:
                                </span>{" "}
                                {reaction.exposureRoute.text ??
                                  reaction.exposureRoute.coding?.[0]?.display}
                              </div>
                            )}
                            {reaction.description && (
                              <div className="text-sm mt-1">
                                <span className="font-medium text-gray-700">
                                  Description:
                                </span>{" "}
                                {reaction.description}
                              </div>
                            )}
                            {reaction.onset && (
                              <div className="text-sm mt-1 text-gray-600">
                                <span className="font-medium">Onset:</span>{" "}
                                {formatDate(reaction.onset)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Type and Additional Info */}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                      {allergy.type && (
                        <div>
                          <span className="font-medium">Type:</span>{" "}
                          {capitalize(allergy.type)}
                        </div>
                      )}
                      {allergy.onsetDateTime && (
                        <div>
                          <span className="font-medium">Onset:</span>{" "}
                          {formatDate(allergy.onsetDateTime)}
                        </div>
                      )}
                      {allergy.recordedDate && (
                        <div>
                          <span className="font-medium">Recorded:</span>{" "}
                          {formatDate(allergy.recordedDate)}
                        </div>
                      )}
                      {allergy.lastOccurrence && (
                        <div>
                          <span className="font-medium">Last Occurrence:</span>{" "}
                          {formatDate(allergy.lastOccurrence)}
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {allergy.note && allergy.note.length > 0 && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium text-gray-700">
                          Notes:
                        </span>
                        <div className="mt-1 italic text-gray-600">
                          {allergy.note.map((note, idx) => (
                            <div key={idx}>• {note.text}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function MedicationsDisplay({
  medications,
}: {
  medications: MedicationRequest[];
}) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-300";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "stopped":
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      case "on-hold":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getPriorityColor = (priority?: string) => {
    if (priority === "urgent" || priority === "stat") {
      return "text-red-600 font-bold";
    }
    return "text-gray-700";
  };

  // Filter for active medications only
  const activeMedications = medications.filter(
    (med) => med.status === "active" || med.status === "on-hold",
  );

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <div className="mb-4 pb-2 border-b">
        <h3 className="text-xl font-semibold text-gray-800">
          Current Medications
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Active prescriptions and medications
        </p>
      </div>
      {activeMedications.length === 0 ? (
        <div className="text-gray-500 italic">
          No active medications documented
        </div>
      ) : (
        <div className="space-y-3">
          {activeMedications.map((med) => (
            <div
              key={med.id}
              className="p-3 rounded border-l-4 border-green-500 bg-gray-50"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`font-semibold text-base ${getPriorityColor(
                        med.priority,
                      )}`}
                    >
                      {med.medicationCodeableConcept?.text ??
                        med.medicationCodeableConcept?.coding?.[0]?.display ??
                        "Unknown Medication"}
                    </span>
                    {med.priority && med.priority !== "routine" && (
                      <span className="px-2 py-0.5 text-xs rounded border bg-red-100 text-red-800 border-red-300">
                        {med.priority.toUpperCase()}
                      </span>
                    )}
                  </div>
                  {med.medicationCodeableConcept?.coding?.[0]?.code && (
                    <div className="text-xs text-gray-500">
                      Code: {med.medicationCodeableConcept.coding[0].code} (
                      {med.medicationCodeableConcept.coding[0].system
                        ?.split("/")
                        .pop()}
                      )
                    </div>
                  )}
                </div>
                {med.status && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(
                      med.status,
                    )}`}
                  >
                    {med.status.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Dosage Instructions */}
              {med.dosageInstruction && med.dosageInstruction.length > 0 && (
                <div className="mt-2 space-y-2">
                  {med.dosageInstruction.map((dosage, idx) => (
                    <div key={idx} className="pl-3 border-l-2 border-gray-300">
                      {dosage.text && (
                        <div className="text-sm text-gray-800">
                          <span className="font-medium">Instructions:</span>{" "}
                          {dosage.text}
                        </div>
                      )}
                      {dosage.doseAndRate?.[0] && (
                        <div className="text-sm text-gray-700 mt-1">
                          <span className="font-medium">Dose:</span>{" "}
                          {dosage.doseAndRate[0].doseQuantity?.value}{" "}
                          {dosage.doseAndRate[0].doseQuantity?.unit ??
                            dosage.doseAndRate[0].doseQuantity?.code}
                        </div>
                      )}
                      {dosage.route && (
                        <div className="text-sm text-gray-700 mt-1">
                          <span className="font-medium">Route:</span>{" "}
                          {dosage.route.text ??
                            dosage.route.coding?.[0]?.display}
                        </div>
                      )}
                      {dosage.timing && (
                        <div className="text-sm text-gray-700 mt-1">
                          <span className="font-medium">Frequency:</span>{" "}
                          {dosage.timing.repeat?.frequency &&
                            dosage.timing.repeat?.period && (
                              <>
                                {dosage.timing.repeat.frequency} time(s) per{" "}
                                {dosage.timing.repeat.period}{" "}
                                {dosage.timing.repeat.periodUnit}
                              </>
                            )}
                          {dosage.timing.code && (
                            <span>
                              {dosage.timing.code.text ??
                                dosage.timing.code.coding?.[0]?.display}
                            </span>
                          )}
                        </div>
                      )}
                      {dosage.additionalInstruction &&
                        dosage.additionalInstruction.length > 0 && (
                          <div className="text-sm text-gray-600 mt-1 italic">
                            {dosage.additionalInstruction
                              .map(
                                (inst) =>
                                  inst.text ?? inst.coding?.[0]?.display,
                              )
                              .join(", ")}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}

              {/* Dates and Additional Info */}
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                {med.authoredOn && (
                  <div>
                    <span className="font-medium">Prescribed:</span>{" "}
                    {formatDate(med.authoredOn)}
                  </div>
                )}
                {med.dispenseRequest?.validityPeriod?.start && (
                  <div>
                    <span className="font-medium">Start:</span>{" "}
                    {formatDate(med.dispenseRequest.validityPeriod.start)}
                  </div>
                )}
                {med.dispenseRequest?.validityPeriod?.end && (
                  <div>
                    <span className="font-medium">End:</span>{" "}
                    {formatDate(med.dispenseRequest.validityPeriod.end)}
                  </div>
                )}
                {med.dispenseRequest?.numberOfRepeatsAllowed !== undefined && (
                  <div>
                    <span className="font-medium">Refills:</span>{" "}
                    {med.dispenseRequest.numberOfRepeatsAllowed}
                  </div>
                )}
                {med.dispenseRequest?.quantity && (
                  <div>
                    <span className="font-medium">Quantity:</span>{" "}
                    {med.dispenseRequest.quantity.value}{" "}
                    {med.dispenseRequest.quantity.unit}
                  </div>
                )}
              </div>

              {/* Prescriber */}
              {med.requester && (
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Prescriber:</span>{" "}
                  {med.requester.display ?? "Unknown"}
                </div>
              )}

              {/* Reason */}
              {med.reasonCode && med.reasonCode.length > 0 && (
                <div className="mt-2 text-sm">
                  <span className="font-medium text-gray-700">Reason:</span>
                  <div className="mt-1 text-gray-600">
                    {med.reasonCode
                      .map(
                        (reason) => reason.text ?? reason.coding?.[0]?.display,
                      )
                      .join(", ")}
                  </div>
                </div>
              )}

              {/* Notes */}
              {med.note && med.note.length > 0 && (
                <div className="mt-2 text-sm">
                  <span className="font-medium text-gray-700">Notes:</span>
                  <div className="mt-1 italic text-gray-600">
                    {med.note.map((note, idx) => (
                      <div key={idx}>• {note.text}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PatientCard({ patient }: { patient: Patient }) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAge = (birthDate?: string) => {
    if (!birthDate) return "N/A";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const primaryName = patient.name?.[0];
  const homeAddress =
    patient.address?.find((addr) => addr.use === "home") ??
    patient.address?.[0];
  const homeTelecom = patient.telecom?.find(
    (tel) => tel.system === "phone" && tel.use === "home",
  );
  const mobileTelecom = patient.telecom?.find(
    (tel) => tel.system === "phone" && tel.use === "mobile",
  );
  const emailTelecom = patient.telecom?.find((tel) => tel.system === "email");
  const mrn = patient.identifier?.find(
    (id) => id.type?.coding?.[0]?.code === "MR",
  );

  return (
    <div className="border p-4 shadow-sm rounded-lg bg-white">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
        Patient Chart
      </h2>

      {/* Demographics Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div>
          <div className="font-light text-sm text-gray-600">MRN</div>
          <div className="font-medium">{mrn?.value ?? patient.id ?? "N/A"}</div>
        </div>

        <div>
          <div className="font-light text-sm text-gray-600">Full Name</div>
          <div className="font-medium">
            {primaryName?.prefix?.join(" ")} {primaryName?.given?.join(" ")}{" "}
            {primaryName?.family} {primaryName?.suffix?.join(" ")}
          </div>
        </div>

        <div>
          <div className="font-light text-sm text-gray-600">Date of Birth</div>
          <div className="font-medium">{formatDate(patient.birthDate)}</div>
        </div>

        <div>
          <div className="font-light text-sm text-gray-600">Age</div>
          <div className="font-medium">{getAge(patient.birthDate)} years</div>
        </div>

        <div>
          <div className="font-light text-sm text-gray-600">Gender</div>
          <div className="font-medium">
            {patient.gender ? capitalize(patient.gender) : "N/A"}
          </div>
        </div>

        <div>
          <div className="font-light text-sm text-gray-600">Status</div>
          <div className="font-medium">
            {patient.active ? (
              <span className="text-green-600">Active</span>
            ) : (
              <span className="text-red-600">Inactive</span>
            )}
          </div>
        </div>

        {patient.maritalStatus && (
          <div>
            <div className="font-light text-sm text-gray-600">
              Marital Status
            </div>
            <div className="font-medium">
              {patient.maritalStatus.text ??
                patient.maritalStatus.coding?.[0]?.display ??
                "N/A"}
            </div>
          </div>
        )}

        {patient.multipleBirthBoolean !== undefined && (
          <div>
            <div className="font-light text-sm text-gray-600">
              Multiple Birth
            </div>
            <div className="font-medium">
              {patient.multipleBirthBoolean ? "Yes" : "No"}
            </div>
          </div>
        )}

        {patient.deceasedBoolean !== undefined && (
          <div>
            <div className="font-light text-sm text-gray-600">Deceased</div>
            <div className="font-medium">
              {patient.deceasedBoolean ? (
                <span className="text-red-600">Yes</span>
              ) : (
                "No"
              )}
            </div>
          </div>
        )}

        {patient.deceasedDateTime && (
          <div>
            <div className="font-light text-sm text-gray-600">
              Date of Death
            </div>
            <div className="font-medium">
              {formatDate(patient.deceasedDateTime)}
            </div>
          </div>
        )}
      </div>

      {/* Contact Information Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {homeAddress && (
            <div>
              <div className="font-light text-sm text-gray-600">Address</div>
              <div className="font-medium">
                {homeAddress.line?.join(", ")}
                {homeAddress.line && <br />}
                {homeAddress.city}, {homeAddress.state} {homeAddress.postalCode}
                {homeAddress.country && <>, {homeAddress.country}</>}
              </div>
            </div>
          )}

          <div>
            {homeTelecom && (
              <div className="mb-2">
                <div className="font-light text-sm text-gray-600">
                  Home Phone
                </div>
                <div className="font-medium">{homeTelecom.value ?? "N/A"}</div>
              </div>
            )}
            {mobileTelecom && (
              <div className="mb-2">
                <div className="font-light text-sm text-gray-600">
                  Mobile Phone
                </div>
                <div className="font-medium">
                  {mobileTelecom.value ?? "N/A"}
                </div>
              </div>
            )}
            {emailTelecom && (
              <div>
                <div className="font-light text-sm text-gray-600">Email</div>
                <div className="font-medium">{emailTelecom.value ?? "N/A"}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Communication & Language Section */}
      {patient.communication && patient.communication.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Languages
          </h3>
          <div className="flex flex-wrap gap-2">
            {patient.communication.map((comm, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {comm.language.text ??
                  comm.language.coding?.[0]?.display ??
                  "Unknown"}
                {comm.preferred && " (Preferred)"}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Additional Identifiers Section */}
      {patient.identifier && patient.identifier.length > 1 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Additional Identifiers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {patient.identifier
              .filter((id) => id.type?.coding?.[0]?.code !== "MR")
              .map((id, idx) => (
                <div key={idx}>
                  <div className="font-light text-sm text-gray-600">
                    {id.type?.text ??
                      id.type?.coding?.[0]?.display ??
                      id.system ??
                      "Identifier"}
                  </div>
                  <div className="font-medium text-sm">{id.value}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Contact Persons Section */}
      {patient.contact && patient.contact.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Emergency Contacts
          </h3>
          {patient.contact.map((contact, idx) => (
            <div key={idx} className="mb-3 p-3 bg-gray-50 rounded">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <div className="font-light text-sm text-gray-600">Name</div>
                  <div className="font-medium">
                    {contact.name?.given?.join(" ")} {contact.name?.family}
                  </div>
                </div>
                <div>
                  <div className="font-light text-sm text-gray-600">
                    Relationship
                  </div>
                  <div className="font-medium">
                    {contact.relationship?.[0]?.text ??
                      contact.relationship?.[0]?.coding?.[0]?.display ??
                      "N/A"}
                  </div>
                </div>
                {contact.telecom?.[0] && (
                  <div>
                    <div className="font-light text-sm text-gray-600">
                      Phone
                    </div>
                    <div className="font-medium">
                      {contact.telecom[0].value}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EncounterTimeline({
  encounters,
  observations,
  conditions,
  medicationRequests,
}: {
  encounters: Encounter[];
  observations: Observation[];
  conditions: Condition[];
  medicationRequests: MedicationRequest[];
}) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "finished":
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
      case "active":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
      case "stopped":
        return "bg-red-100 text-red-800";
      case "planned":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEncounterType = (encounter: Encounter) => {
    return (
      encounter.type?.[0]?.text ??
      encounter.type?.[0]?.coding?.[0]?.display ??
      encounter.class?.display ??
      "Visit"
    );
  };

  // Sort encounters by date (most recent first)
  const sortedEncounters = [...encounters].sort((a, b) => {
    const dateA = new Date(a.period?.start ?? a.period?.end ?? "").getTime();
    const dateB = new Date(b.period?.start ?? b.period?.end ?? "").getTime();
    return dateB - dateA;
  });

  // Filter clinical data by encounter
  const getEncounterData = (encounterId: string) => {
    const encounterObservations = observations.filter((obs) =>
      obs.encounter?.reference?.includes(encounterId),
    );
    const encounterConditions = conditions.filter((cond) =>
      cond.encounter?.reference?.includes(encounterId),
    );
    const encounterMeds = medicationRequests.filter((med) =>
      med.encounter?.reference?.includes(encounterId),
    );
    return { encounterObservations, encounterConditions, encounterMeds };
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <div className="mb-4 pb-2 border-b">
        <h3 className="text-xl font-semibold text-gray-800">
          Clinical Timeline
        </h3>
      </div>
      {sortedEncounters.length === 0 ? (
        <div className="text-gray-500 italic">No encounters documented</div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300" />

          <div className="space-y-6">
            {sortedEncounters.map((encounter, idx) => {
              const {
                encounterObservations,
                encounterConditions,
                encounterMeds,
              } = getEncounterData(encounter.id ?? "");

              const hasData =
                encounterObservations.length > 0 ||
                encounterConditions.length > 0 ||
                encounterMeds.length > 0;

              return (
                <div key={encounter.id ?? idx} className="relative pl-12">
                  {/* Timeline dot */}
                  <div className="absolute left-4 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-500 border-4 border-white" />

                  <div className="bg-gray-50 rounded-lg border p-4">
                    {/* Encounter Header */}
                    <div className="mb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">
                            {getEncounterType(encounter)}
                          </h4>
                          <div className="text-sm text-gray-600">
                            {formatDateTime(encounter.period?.start)}
                            {encounter.period?.end && (
                              <> — {formatDateTime(encounter.period.end)}</>
                            )}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded font-medium ${getStatusColor(
                            encounter.status,
                          )}`}
                        >
                          {encounter.status?.toUpperCase()}
                        </span>
                      </div>

                      {/* Encounter Details */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {encounter.serviceType && (
                          <div>
                            <span className="font-medium text-gray-700">
                              Service:
                            </span>{" "}
                            {encounter.serviceType.text ??
                              encounter.serviceType.coding?.[0]?.display}
                          </div>
                        )}
                        {encounter.priority && (
                          <div>
                            <span className="font-medium text-gray-700">
                              Priority:
                            </span>{" "}
                            {encounter.priority.text ??
                              encounter.priority.coding?.[0]?.display}
                          </div>
                        )}
                        {encounter.location?.[0] && (
                          <div>
                            <span className="font-medium text-gray-700">
                              Location:
                            </span>{" "}
                            {encounter.location[0].location?.display ?? "N/A"}
                          </div>
                        )}
                        {encounter.participant?.[0] && (
                          <div>
                            <span className="font-medium text-gray-700">
                              Provider:
                            </span>{" "}
                            {encounter.participant[0].individual?.display ??
                              "N/A"}
                          </div>
                        )}
                      </div>

                      {encounter.reasonCode?.[0] && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium text-gray-700">
                            Reason:
                          </span>{" "}
                          {encounter.reasonCode[0].text ??
                            encounter.reasonCode[0].coding?.[0]?.display}
                        </div>
                      )}
                    </div>

                    {/* Clinical Data */}
                    {hasData && (
                      <div className="mt-4 space-y-4 border-t pt-4">
                        {/* Conditions */}
                        {encounterConditions.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold text-gray-700 mb-2">
                              Diagnoses & Conditions (
                              {encounterConditions.length})
                            </h5>
                            <div className="space-y-2">
                              {encounterConditions.map((condition) => (
                                <div
                                  key={condition.id}
                                  className="bg-white rounded p-2 text-sm"
                                >
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <span className="font-medium">
                                        {condition.code?.text ??
                                          condition.code?.coding?.[0]
                                            ?.display ??
                                          "Unknown Condition"}
                                      </span>
                                      {condition.severity && (
                                        <span className="ml-2 text-xs text-gray-600">
                                          (
                                          {condition.severity.text ??
                                            condition.severity.coding?.[0]
                                              ?.display}
                                          )
                                        </span>
                                      )}
                                    </div>
                                    {condition.clinicalStatus && (
                                      <span
                                        className={`px-2 py-0.5 text-xs rounded ${getStatusColor(
                                          condition.clinicalStatus.coding?.[0]
                                            ?.code,
                                        )}`}
                                      >
                                        {
                                          condition.clinicalStatus.coding?.[0]
                                            ?.code
                                        }
                                      </span>
                                    )}
                                  </div>
                                  {condition.note?.[0] && (
                                    <div className="mt-1 text-xs text-gray-600 italic">
                                      {condition.note[0].text}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Observations */}
                        {encounterObservations.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold text-gray-700 mb-2">
                              Observations & Vitals (
                              {encounterObservations.length})
                            </h5>
                            <div className="grid grid-cols-2 gap-2">
                              {encounterObservations.slice(0, 10).map((obs) => (
                                <div
                                  key={obs.id}
                                  className="bg-white rounded p-2 text-sm"
                                >
                                  <div className="font-medium text-gray-700">
                                    {obs.code?.text ??
                                      obs.code?.coding?.[0]?.display}
                                  </div>
                                  <div className="text-gray-900">
                                    {obs.valueQuantity?.value}{" "}
                                    {obs.valueQuantity?.unit ??
                                      obs.valueQuantity?.code}
                                    {obs.valueString && obs.valueString}
                                    {obs.valueCodeableConcept &&
                                      (obs.valueCodeableConcept.text ??
                                        obs.valueCodeableConcept.coding?.[0]
                                          ?.display)}
                                  </div>
                                  {obs.effectiveDateTime && (
                                    <div className="text-xs text-gray-500">
                                      {formatDateTime(obs.effectiveDateTime)}
                                    </div>
                                  )}
                                </div>
                              ))}
                              {encounterObservations.length > 10 && (
                                <div className="text-xs text-gray-500 italic">
                                  +{encounterObservations.length - 10} more...
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Medications */}
                        {encounterMeds.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold text-gray-700 mb-2">
                              Medications Prescribed ({encounterMeds.length})
                            </h5>
                            <div className="space-y-2">
                              {encounterMeds.map((med) => (
                                <div
                                  key={med.id}
                                  className="bg-white rounded p-2 text-sm"
                                >
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <span className="font-medium">
                                        {med.medicationCodeableConcept?.text ??
                                          med.medicationCodeableConcept
                                            ?.coding?.[0]?.display ??
                                          "Unknown Medication"}
                                      </span>
                                      {med.dosageInstruction?.[0] && (
                                        <div className="text-xs text-gray-600 mt-1">
                                          {med.dosageInstruction[0].text ??
                                            `${med.dosageInstruction[0].doseAndRate?.[0]?.doseQuantity?.value} ${med.dosageInstruction[0].doseAndRate?.[0]?.doseQuantity?.unit}`}
                                        </div>
                                      )}
                                    </div>
                                    {med.status && (
                                      <span
                                        className={`px-2 py-0.5 text-xs rounded ${getStatusColor(
                                          med.status,
                                        )}`}
                                      >
                                        {med.status}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
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

  const observations =
    ((
      patientData?.entry?.[1]?.resource as unknown as Bundle | undefined
    )?.entry?.map((e) => e.resource) as unknown as Observation[]) ?? [];

  const encounters =
    ((
      patientData?.entry?.[2]?.resource as unknown as Bundle | undefined
    )?.entry?.map((e) => e.resource) as unknown as Encounter[]) ?? [];

  const conditions =
    ((
      patientData?.entry?.[3]?.resource as unknown as Bundle | undefined
    )?.entry?.map((e) => e.resource) as unknown as Condition[]) ?? [];

  const medicationRequests =
    ((
      patientData?.entry?.[4]?.resource as unknown as Bundle | undefined
    )?.entry?.map((e) => e.resource) as unknown as MedicationRequest[]) ?? [];

  const allergies: Record<code, AllergyIntolerance[] | undefined> =
    Object.groupBy(
      ((
        patientData?.entry?.[6]?.resource as unknown as Bundle | undefined
      )?.entry?.map((e) => e.resource) as unknown as AllergyIntolerance[]) ??
        [],
      (a: AllergyIntolerance) => a.category?.[0] ?? "",
    );

  return (
    <main className="space-y-8">
      {patient && <PatientCard patient={patient} />}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AllergyDisplay allergies={allergies} />
        <MedicationsDisplay medications={medicationRequests} />
      </div>
      <EncounterTimeline
        encounters={encounters}
        observations={observations}
        conditions={conditions}
        medicationRequests={medicationRequests}
      />
    </main>
  );
}
