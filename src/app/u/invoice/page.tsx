import dynamic from 'next/dynamic';

const UserInvoiceComponent = dynamic(() => import('@/components/UserInvoiceComponent'), {
  ssr: false, // prevent server-side rendering
});

export default function UserInvoicePage() {
  return <UserInvoiceComponent />;
}
