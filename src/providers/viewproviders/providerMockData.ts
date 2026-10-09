import type { TagTone } from "@/components/Tags";

/**
 * Sample data for the provider detail screen until it is wired to `GET /practitioners/:id`.
 * The Providers list itself is loaded from the API.
 */
export type ProviderRow = {
  name: string;
  credential: string;
  npi: string;
  specialty: string;
  clinic: string;
  city: string;
  license: string;
  licenseTone: TagTone;
  dea: string;
  deaTone: TagTone;
  status: string;
  statusTone: TagTone;
  email?: string;
  phone?: string;
  address?: string;
};

export const PROVIDERS: ProviderRow[] = [
  { name: "Dr. Michael Brown", credential: "MD", npi: "1234567890", specialty: "Internal Medicine", clinic: "Main Clinic", city: "New York, NY", license: "Valid", licenseTone: "success", dea: "Valid", deaTone: "success", status: "Active", statusTone: "success", email: "michael.brown@koolmd.com", phone: "+1 (555) 123-4567", address: "123 Medical Center Dr, New York, NY 10001" },
  { name: "Dr. Sarah Lee", credential: "DO", npi: "9876543210", specialty: "Pediatrics", clinic: "West Clinic", city: "San Francisco, CA", license: "Valid", licenseTone: "success", dea: "Valid", deaTone: "success", status: "Active", statusTone: "success", email: "sarah.lee@koolmd.com", phone: "+1 (555) 987-6543", address: "456 Bay Street, San Francisco, CA 94102" },
  { name: "Dr. James Wilson", credential: "MD", npi: "4567891230", specialty: "Cardiology", clinic: "East Clinic", city: "Boston, MA", license: "Expiring Soon", licenseTone: "warning", dea: "Valid", deaTone: "success", status: "Active", statusTone: "success", email: "james.wilson@koolmd.com", phone: "+1 (555) 456-7891", address: "789 Commonwealth Ave, Boston, MA 02215" },
  { name: "Dr. Emily Davis", credential: "NP", npi: "3216549870", specialty: "Family Medicine", clinic: "North Clinic", city: "Chicago, IL", license: "Valid", licenseTone: "success", dea: "N/A", deaTone: "neutral", status: "Active", statusTone: "success", email: "emily.davis@koolmd.com", phone: "+1 (555) 321-6549", address: "321 Michigan Ave, Chicago, IL 60601" },
  { name: "Dr. Robert Chen", credential: "MD", npi: "1597534860", specialty: "Dermatology", clinic: "Main Clinic", city: "New York, NY", license: "Expired", licenseTone: "danger", dea: "Valid", deaTone: "success", status: "Inactive", statusTone: "danger", email: "robert.chen@koolmd.com", phone: "+1 (555) 159-7534", address: "123 Medical Center Dr, New York, NY 10001" },
  { name: "Dr. Amanda White", credential: "PA", npi: "7539519510", specialty: "Orthopedics", clinic: "South Clinic", city: "Austin, TX", license: "Valid", licenseTone: "success", dea: "N/A", deaTone: "neutral", status: "Active", statusTone: "success", email: "amanda.white@koolmd.com", phone: "+1 (555) 753-9519", address: "555 Congress Ave, Austin, TX 78701" },
  { name: "Dr. Richard Taylor", credential: "MD", npi: "9517538640", specialty: "Neurology", clinic: "West Clinic", city: "San Francisco, CA", license: "Valid", licenseTone: "success", dea: "Valid", deaTone: "success", status: "Pending", statusTone: "warning", email: "richard.taylor@koolmd.com", phone: "+1 (555) 951-7538", address: "456 Bay Street, San Francisco, CA 94102" },
  { name: "Dr. Olivia Martinez", credential: "MD", npi: "8529637410", specialty: "Emergency Medicine", clinic: "Central Clinic", city: "Dallas, TX", license: "Valid", licenseTone: "success", dea: "Valid", deaTone: "success", status: "Active", statusTone: "success", email: "olivia.martinez@koolmd.com", phone: "+1 (555) 852-9637", address: "999 Main St, Dallas, TX 75201" },
];
