// components/AdmissionDocument.tsx
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer';

Font.register({
  family: 'Poppins',
  fonts: [
    { src: '/fonts/Poppins-Regular.ttf' },
    { src: '/fonts/Poppins-Bold.ttf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Poppins',
    fontSize: 12,
    padding: 30,
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: { fontSize: 24, color: '#007BFF' },
  meta: { fontSize: 10, textAlign: 'right' },
  section: { marginBottom: 10 },
  sectionTitle: { fontSize: 14, marginBottom: 6, fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  profileWrapper: { flexDirection: 'row', justifyContent: 'space-between' },
  profileImage: { width: 100, height: 100, borderRadius: 4 },
  docImage: { width: 200, height: 130, marginBottom: 10 },
  footer: { marginTop: 20, fontSize: 10, textAlign: 'center', color: '#888' },
});

interface AdmissionPDFProps {
  admission: {
    _id: string;
    courseTitle: string;
    courseId: string;
    profileImageUrl: string;
    aadhaarImageUrl?: string; // legacy
    aadhaarFrontUrl: string;
    aadhaarBackUrl: string;
    aadhaarNumber: string;
    name: string;
    fatherName: string;
    dob: string;
    address1: string;
    address2: string;
    state: string;
    transactionId: string;
    createdAt: string;
    email?: string;
    phone?: string;
    city?: string;
  };
}

export const AdmissionDocument: React.FC<AdmissionPDFProps> = ({ admission }) => {
  const {
    courseTitle,
    courseId,
    profileImageUrl,
    aadhaarFrontUrl,
    aadhaarBackUrl,
    aadhaarNumber,
    name,
    fatherName,
    dob,
    address1,
    address2,
    state,
    transactionId,
    createdAt,
    email,
    phone,
    city,
  } = admission;

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ADMISSION FORM</Text>
          <View style={styles.meta}>
            <Text>ID: {transactionId}</Text>
            <Text>Date: {fmt(createdAt)}</Text>
            <Text>Career Shiksha</Text>
            <Text>A‑79, Ganga Vatika, Meerut, UP 250001</Text>
            <Text>Email: affordablecareersolutions@gmail.com</Text>
          </View>
        </View>

        {/* Student Info + Profile Pic */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Student Details</Text>
          <View style={styles.profileWrapper}>
            <View>
              <Text>Name: {name}</Text>
              <Text>Father&apos;s Name: {fatherName}</Text>
              {email && <Text>Email: {email}</Text>}
              {phone && <Text>Phone: {phone}</Text>}
              <Text>DOB: {fmt(dob)}</Text>
              <Text>Aadhaar #: {aadhaarNumber}</Text>
            </View>
            {profileImageUrl && (
              <Image src={profileImageUrl} style={styles.profileImage} />
            )}
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <Text>
            {address1}
            {address2 ? `, ${address2}` : ''}, {city ?? state}, {state}
          </Text>
        </View>

        {/* Course */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Enrolled</Text>
          <Text>{courseTitle} (ID: {courseId})</Text>
        </View>

        {/* Documents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents</Text>
          {aadhaarFrontUrl && (
            <>
              <Text>Aadhaar Front:</Text>
              <Image src={aadhaarFrontUrl} style={styles.docImage} />
            </>
          )}
          {aadhaarBackUrl && (
            <>
              <Text>Aadhaar Back:</Text>
              <Image src={aadhaarBackUrl} style={styles.docImage} />
            </>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This is a system‑generated admission form. Carry your ID to all sessions.
        </Text>
      </Page>
    </Document>
  );
};
