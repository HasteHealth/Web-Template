import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("layout/main_layout.tsx", [
    index("routes/PatientList.tsx"),
    route("patient/:pid", "routes/Patient.tsx"),
  ]),
] satisfies RouteConfig;
