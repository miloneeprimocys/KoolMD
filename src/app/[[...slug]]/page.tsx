"use client";

import { useParams } from "next/navigation";
import MainLayout from "@/app/Mainlayout";
import { ROUTES } from "@/app/routes";

const NotFound = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <h1 className="mb-4 text-4xl font-bold">404</h1>
      <p className="text-gray-600">Page not found</p>
    </div>
  </div>
);

export default function CatchAllPage() {
  const params = useParams();
  const slug = params.slug as string[] | undefined; // use params.pages if you renamed the folder
  const path = slug?.join("/") ?? "";

  const route = ROUTES[path];
  if (!route) return <NotFound />;

  const Page = route.component;

  return route.title ? (
    <MainLayout title={route.title}>
      <Page />
    </MainLayout>
  ) : (
    <Page />
  );
}