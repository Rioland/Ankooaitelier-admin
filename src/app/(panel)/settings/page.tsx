import { PageHeader } from "@/components/admin/ui";
import SettingsForm from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/queries";

export default async function SettingsPage() {
  const s = await getSettings();
  return (<><PageHeader title="Settings" desc="Store details, WhatsApp ordering number, delivery fees and social links." /><SettingsForm s={s} /></>);
}
