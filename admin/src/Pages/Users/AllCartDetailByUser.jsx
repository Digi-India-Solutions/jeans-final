import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getData } from '../../services/FetchNodeServices';
import { Box, Card, CardContent, Typography, Grid, Avatar, Divider, Button, CircularProgress, Paper, Stack, Chip } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function AllCartDetailByUser() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const user = location?.state?.user;
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchCartByUser = async () => {
        try {
            setLoading(true);
            const response = await getData(`api/card/get-card-by-user-id/${id}`);
            if (response.success) setCart(response.card);
        } catch (err) {
            console.error('Error fetching cart:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchCartByUser();
    }, [id]);

    const formatCurrency = (amount) => `₹${amount?.toLocaleString('en-IN')}`;

    const handleDownloadExcel = () => {
        if (!cart || !cart.items.length) return;

        const data = cart.items.map((item) => {
            const sub = item.subProduct;
            return {
                'Product Name': sub?.productId?.productName || 'N/A',
                'Set': sub?.set || 'N/A',
                'Final Price': sub?.finalPrice || 0,
                'Cart Price': item?.price || 0,
                'Quantity': item?.quantity || 0,
                'Status': item?.status || 'N/A',
                'Created At': new Date(cart.createdAt).toLocaleString()
            };
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'CartItems');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, `UserCart_${user?.name || 'User'}.xlsx`);
    };

    return (
        <Box p={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4">User Cart Details</Typography>
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" color="secondary" onClick={handleDownloadExcel}>
                        Download Excel
                    </Button>
                    <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
                        Back
                    </Button>
                </Stack>
            </Stack>

            {user && (
                <Card sx={{ mb: 4 }}>
                    <CardContent>
                        <Typography variant="h6">{user.name}</Typography>
                        <Typography>Email: {user.email}</Typography>
                        <Typography>Phone: {user.phone}</Typography>
                        {user.address && (
                            <Typography>
                                Address: {user.address.street}, {user.address.city}, {user.address.state} - {user.address.zipCode}
                            </Typography>
                        )}
                        <Typography>User ID: {user.uniqueUserId}</Typography>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <Box textAlign="center" mt={5}>
                    <CircularProgress />
                </Box>
            ) : cart ? (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Cart Items (Total: {cart.items.length})
                    </Typography>

                    <Grid container spacing={3}>
                        {cart.items.map((item, index) => {
                            const sub = item.subProduct;
                            const productName = sub?.productId?.productName || 'Unnamed Product';
                            const image = sub?.subProductImages?.[0] || '';
                            return (
                                <Grid item xs={12} sm={6} md={4} key={item._id}>
                                    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Avatar
                                                    variant="rounded"
                                                    src={image}
                                                    alt="Product Image"
                                                    sx={{ width: '100%', height: 150 }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="h6">{productName}</Typography>
                                                <Typography variant="body2">Set: {sub.set}</Typography>
                                                <Typography variant="body2">Final Price: {formatCurrency(sub.finalPrice)}</Typography>
                                                <Typography variant="body2">Cart Price: {formatCurrency(item.price)}</Typography>
                                                <Typography variant="body2">Quantity: {item.quantity}</Typography>
                                                <Chip label={item.status} color="warning" size="small" sx={{ mt: 1 }} />
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>
                            );
                        })}
                    </Grid>

                    <Divider sx={{ my: 4 }} />

                    <Typography variant="h6">
                        Total Amount: <strong>{formatCurrency(cart.totalAmount)}</strong>
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Created At: {new Date(cart.createdAt).toLocaleString()}
                    </Typography>
                </Box>
            ) : (
                <Typography variant="body1" mt={4}>
                    No cart data available.
                </Typography>
            )}
        </Box>
    );
}

export default AllCartDetailByUser;
