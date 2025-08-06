// InvoicePDF.jsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, lineHeight: 1.5 },
  header: { textAlign: 'center', marginBottom: 10 },
  section: { marginBottom: 10 },
  row: { flexDirection: 'row' },
  label: { fontWeight: 'bold' },
  table: { marginTop: 10, borderWidth: 1, borderColor: '#000' },
  tableRow: { flexDirection: 'row', borderBottom: '1 solid #000' },
  cell: { padding: 4, borderRight: '1 solid #000', textAlign: 'center' },
  col1: { width: '5%' },
  col2: { width: '30%' },
  col3: { width: '10%' },
  col4: { width: '10%' },
  col5: { width: '10%' },
  col6: { width: '10%' },
  col7: { width: '15%' },
  col8: { width: '10%', borderRight: 'none' },
  footer: { marginTop: 20, textAlign: 'center' },
});

const InvoicePDF = ({ order, user }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>TAX INVOICE</Text>

      <View style={styles.section}>
        <Text><Text style={styles.label}>Order ID:</Text> {order.orderUniqueId}</Text>
        <Text><Text style={styles.label}>Date:</Text> {new Date(order.orderDate).toLocaleDateString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Billed To:</Text>
        <Text>{user?.name}, {user?.phone}</Text>
        <Text>{user?.email}</Text>
        <Text>{order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.cell, styles.col1]}>#</Text>
          <Text style={[styles.cell, styles.col2]}>Product ID</Text>
          <Text style={[styles.cell, styles.col3]}>Set</Text>
          <Text style={[styles.cell, styles.col4]}>Color</Text>
          <Text style={[styles.cell, styles.col5]}>Qty</Text>
          <Text style={[styles.cell, styles.col6]}>Rate</Text>
          <Text style={[styles.cell, styles.col7]}>Total</Text>
          <Text style={[styles.cell, styles.col8]}>Size</Text>
        </View>

        {order.products?.map((item, i) => {
          const sub = item.subProduct?.[0];
          console.log('CCCCCCCCC:==>',item)
          return (
            <View style={styles.tableRow} key={i}>
              <Text style={[styles.cell, styles.col1]}>{i + 1}</Text>
              <Text style={[styles.cell, styles.col2]}>{sub?.productId?.productName}</Text>
              <Text style={[styles.cell, styles.col3]}>{sub?.set}</Text>
              <Text style={[styles.cell, styles.col4]}>{sub?.color}</Text>
              <Text style={[styles.cell, styles.col5]}>{item.quantity?.[0]}</Text>
              <Text style={[styles.cell, styles.col6]}>₹{item.price?.[0]}</Text>
              <Text style={[styles.cell, styles.col7]}>₹{(item.price?.[0] * item.quantity?.[0]).toFixed(2)}</Text>
              <Text style={[styles.cell, styles.col8]}>{sub?.sizes?.map(sz => sz.size).join(', ')}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text><Text style={styles.label}>Total Amount:</Text> ₹{order.totalAmount}</Text>
        <Text><Text style={styles.label}>Received:</Text> ₹{order.recivedAmount}</Text>
        <Text><Text style={styles.label}>Pending:</Text> ₹{order.pendingAmount}</Text>
      </View>

      <Text style={styles.footer}>This is a computer-generated invoice. Thank you for shopping with us.</Text>
    </Page>
  </Document>
);

export default InvoicePDF;
