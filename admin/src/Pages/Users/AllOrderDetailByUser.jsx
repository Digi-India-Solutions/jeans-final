import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { getData } from '../../services/FetchNodeServices';
import {
    Box, Typography, Grid, Card, CardContent, Divider, Chip,
    Stack, Paper, Avatar, Button, Badge
} from '@mui/material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from './OrderInvoicePDF'; // <- Make sure path is correct

function AllOrderDetailByUser() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const user = location?.state?.user;
    const [orders, setOrders] = useState([]);

    const fetchOrderByUser = async () => {
        try {
            const { success, orders } = await getData(`api/order/get-all-orders-by-user/${id}`);
            if (success) setOrders(orders);
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    };

    useEffect(() => {
        if (id) fetchOrderByUser();
    }, [id]);
    console.log("orders==>",orders);

    return (
        <Box p={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4">User Order Details</Typography>
                <Button variant="contained" color="primary" onClick={() => navigate(-1)}>Back</Button>
            </Stack>

            {user && (
                <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
                    <Typography variant="h6">{user.name}</Typography>
                    <Typography>Email: {user.email}</Typography>
                    <Typography>Phone: {user.phone}</Typography>
                </Paper>
            )}

            <Grid container spacing={3}>
                {orders.map((order, idx) => (
                    <Grid item xs={12} key={order._id}>
                        <Badge badgeContent={`#${idx + 1}`} color="secondary" />
                        <Card elevation={4}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6" color="primary">
                                        Order: {order.orderUniqueId}
                                    </Typography>
                                    <div style={{gap: '10px' }}> 
                                         <PDFDownloadLink
                                        document={<InvoicePDF order={order} user={user} />}
                                        fileName={`Invoice_${order.orderUniqueId}.pdf`}
                                        style={{ textDecoration: 'none',marginRight: '10px' }}
                                    >
                                        {({ loading }) => (
                                            <Button variant="outlined" color="secondary" disabled={loading}>
                                                {loading ? 'Preparing PDF...' : 'Download Invoice'}
                                            </Button>
                                        )}
                                    </PDFDownloadLink>
                                        <Chip
                                            label={order.paymentStatus}
                                            color={
                                                order.paymentStatus?.toLowerCase() === 'pending'
                                                    ? 'warning'
                                                    : order.paymentStatus?.toLowerCase() === 'successfull'
                                                        ? 'success'
                                                        : 'default'
                                            }
                                            size="small"
                                        />
                                    </div>
                                </Stack>

                                <Divider sx={{ my: 1 }} />

                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2"><strong>Status:</strong> {order.orderStatus}</Typography>
                                        <Typography variant="body2"><strong>Method:</strong> {order.paymentMethod}</Typography>
                                        <Typography variant="body2"><strong>Total:</strong> ₹{order.totalAmount}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2"><strong>Received:</strong> ₹{order.recivedAmount}</Typography>
                                        <Typography variant="body2"><strong>Pending:</strong> ₹{order.pendingAmount}</Typography>
                                        <Typography variant="body2"><strong>Date:</strong> {new Date(order.orderDate).toLocaleString()}</Typography>
                                    </Grid>
                                </Grid>

                                <Divider sx={{ my: 1 }} />

                                <Typography variant="subtitle1" fontWeight="bold">Shipping:</Typography>
                                <Typography variant="body2">
                                    {order.shippingAddress?.name}, {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state}, {order.shippingAddress?.country} - {order.shippingAddress?.postalCode}
                                </Typography>

                                <Divider sx={{ my: 2 }} />

                                <Typography variant="subtitle1" fontWeight="bold">Products:</Typography>
                                {order.products?.map((item, i) => {
                                    const sub = item.subProduct?.[0];
                                    const sizeLabels = sub?.sizes?.map(sz => sz.size).join(', ');
                                    return (
                                        <Paper key={i} variant="outlined" sx={{ p: 2, mt: 2 }}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={4} sm={3}>
                                                    <Avatar
                                                        variant="rounded"
                                                        src={sub?.subProductImages?.[0]}
                                                        alt="Product Image"
                                                        sx={{ width: '100%', height: 100 }}
                                                    />
                                                </Grid>
                                                <Grid item xs={8} sm={9}>
                                                    <Typography variant="subtitle2"><strong>Product ID: {sub?.productId?.productName}</strong></Typography>
                                                    <Typography variant="body2">Set: {sub?.set}</Typography>
                                                    <Typography variant="body2">Color: {sub?.color}</Typography>
                                                    <Typography variant="body2">Size(s): {sizeLabels || '—'}</Typography>
                                                    <Typography variant="body2">Qty: {item.quantity?.[0]}</Typography>
                                                    <Typography variant="body2">Price: ₹{item.price?.[0]}</Typography>
                                                    <Typography variant="body2">Final: ₹{sub?.finalPrice}</Typography>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    );
                                })}


                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default AllOrderDetailByUser;
