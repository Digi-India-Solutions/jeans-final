const mongoose = require("mongoose");
const Card = require('./card-model'); // Update the path as per your project
const Product = require('../products/products-model');
const SubProduct = require('../subProducts/subProducts-model')
const catchAsyncErrors = require('../../middleware/catchAsyncErrors'); // Your wrapper
const Coupon = require("../coupons/coupons-model")

exports.AddToCard = catchAsyncErrors(async (req, res) => {
    try {
        const { user, items, totalAmount, appliedCoupon } = req.body;

        console.log("Received Card Payload:", items?.[0]?.subProduct);

        // Validate main fields
        if (!user || !Array.isArray(items) || items.length === 0 || !totalAmount) {
            return res.status(400).json({ success: false, message: 'Missing required card fields' });
        }
        if (!mongoose.Types.ObjectId.isValid(user)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }

        // Validate each item
        for (let cardItem of items) {

            if (!cardItem.subProduct || !mongoose.Types.ObjectId.isValid(cardItem.subProduct) || !cardItem.price || typeof cardItem.quantity !== 'number' || cardItem.quantity < 1) {
                return res.status(400).json({ success: false, message: 'Invalid card item format' });
            }
            const productExists = await SubProduct.findById(cardItem.subProduct);
            if (!productExists) {
                return res.status(404).json({ success: false, message: `Product not found: ${cardItem.subProduct}` });
            }

        }

        // Find or create cart
        let card = await Card.findOne({ user });
        if (!card) {
            card = new Card({ user, items: [], totalAmount: 0 });
        }

        // Add/update items
        for (let newItem of items) {
            const existingItemIndex = card.items.findIndex(
                i => i.subProduct.toString() === newItem.subProduct && i.price === newItem.price
            );

            if (existingItemIndex > -1) {
                // Update quantity
                card.items[existingItemIndex].quantity += newItem.quantity;
            } else {
                // Properly push a full object
                card.items.push({
                    subProduct: new mongoose.Types.ObjectId(newItem.subProduct),  // convert to ObjectId
                    quantity: newItem.quantity,
                    price: newItem.price,
                    status: 'pending',
                });
            }
        }

        // Recalculate totalAmount
        card.totalAmount = card.items.reduce((sum, i) => sum + (i.quantity * i.price), 0);

        // Handle appliedCoupon
        if (appliedCoupon && appliedCoupon.code && appliedCoupon.discount) {
            card.appliedCoupon = {
                code: appliedCoupon.code,
                discount: appliedCoupon.discount,
            };
        }

        await card.save();
        await card.populate({ path: 'items.subProduct', populate: { path: 'productId' } });

        // Instead of just sending filtered item, send full updated card
        res.status(200).json({ success: true, message: 'Cart updated successfully', card });

    } catch (error) {
        console.error('Add to card error:', error);
        res.status(500).json({ success: false, message: 'Failed to update card', error: error.message });
    }
});


// exports.AddToCard = catchAsyncErrors(async (req, res) => {
//     try {
//         const { user, items , totalAmount } = req.body;

//         // Validate main fields
//         if (!user || !Array.isArray(items) || items.length === 0) {
//             return res.status(400).json({ success: false, message: 'Missing required card fields' });
//         }
//         if (!mongoose.Types.ObjectId.isValid(user)) {
//             return res.status(400).json({ success: false, message: 'Invalid user ID' });
//         }

//         // Validate each item
//         for (let item of items) {
//             if (!item.subProduct || !mongoose.Types.ObjectId.isValid(item.subProduct) || !item.price || typeof item.quantity !== 'number' || item.quantity < 1) {
//                 return res.status(200).json({ success: false, message: 'Invalid card item format' });
//             }
//             const productExists = await SubProduct.findById(item.subProduct);
//             if (!productExists) {
//                 return res.status(204).json({ success: false, message: `Product not found: ${item.subProduct}` });
//             }
//         }

//         // Find or create card
//         let card = await Card.findOne({ user });

//         if (!card) {
//             // No card, create new
//             card = new Card({
//                 user,
//                 items: [],
//                 totalAmount: 0
//             });
//         }

//         // Add or update items
//         for (let newItem of items) {
//             const existingItemIndex = card.items.findIndex(
//                 i => i.subProduct.toString() === newItem.subProduct && i.price === newItem.price
//             );

//             if (existingItemIndex > -1) {
//                 // If item exists, increase quantity
//                 card.items[existingItemIndex].quantity += newItem.quantity;
//             } else {
//                 // Else, push new item
//                 card.items.push({
//                     subProduct: newItem.subProduct,
//                     quantity: newItem.quantity,
//                     price: newItem.price,
//                     status: 'pending'
//                 });
//             }
//         }

//         // Recalculate totalAmount
//         card.totalAmount = card.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

//         await card.save();

//         await card.populate({
//             path: 'items.subProduct',
//         });

//         res.status(200).json({
//             success: true,
//             message: 'Card updated successfully',
//             card
//         });

//     } catch (error) {
//         console.error('Add to card error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to update card',
//             error: error.message
//         });
//     }
// });

exports.getCardById = catchAsyncErrors(async (req, res) => {
    try {
        const { id } = req.params;
        // if (!mongoose.Types.ObjectId.isValid(id)) {
        //     return res.status(400).json({ success: false, message: 'Invalid user ID' });
        // }
        let card = await Card.findOne({ user: id })
            .populate({ path: 'items.subProduct', populate: { path: 'productId', select: "productName" }, select: 'name subProductImages price finalPrice stock ' })
            .populate({ path: 'user', select: 'name email phone' });

        console.log("XXXXXXXXXXX2", card)
        // if (!card) {
        //     card = new Card({ user: id, items: [], totalAmount: 0, });
        //     await card.save();
        // }

        // // Filter out invalid or mismatched products/variants
        // card.items = card.items.filter(item => {
        //     if (!item.product || !item.product.variant) return false;

        //     return item.product.variant.some(variant => variant?.finalPrice === item?.price);
        // });

        // // Optional: update totalAmount based on filtered items
        // card.totalAmount = card.items.reduce((total, item) => total + item.price * item.quantity, 0);

        // await card.save();

        res.status(200).json({ success: true, card, });
    } catch (error) {
        console.error('Get card error:', error);
        res.status(500).json({ success: false, message: 'Failed to get card', error: error.message, });
    }
});

exports.updateCard = catchAsyncErrors(async (req, res) => {
    try {
        const { userId, itemId, action } = req.body;

        // Validate ObjectIds
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(200).json({ success: false, message: 'Invalid userId or itemId' });
        }

        // Fetch user's cart
        const cart = await Card.findOne({ user: userId, items: { $elemMatch: { _id: itemId } } });

        if (!cart) {
            return res.status(204).json({ success: false, message: 'Cart not found' });
        }

        // Find item index
        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

        if (itemIndex === -1) {
            return res.status(204).json({ success: false, message: 'Item not found in cart' });
        }

        const item = cart.items[itemIndex];

        // Fetch product to check stock
        const product = await SubProduct.findById(item.subProduct);

        if (!product) {
            return res.status(204).json({ success: false, message: 'Product not found' });
        }

        // Update quantity based on action
        if (action === "increase") {
            if (item.quantity + 1 > product.stock) {
                return res.status(200).json({ success: false, message: `Cannot exceed stock. Available: ${product.stock}` });
            }
            item.quantity += 1;
        } else if (action === "decrease") {
            if (item.quantity === 1) {
                return res.status(200).json({ success: false, message: 'Quantity cannot be less than 1' });
            }
            item.quantity -= 1;
        } else {
            return res.status(200).json({ success: false, message: 'Invalid action. Use "increase" or "decrease"' });
        }

        item.status = "pending";

        // Recalculate total amount
        cart.totalAmount = cart.items.reduce(
            (total, item) => total + item.quantity * item.price,
            0
        );

        await cart.save();
        await cart.populate({ path: 'items.subProduct', select: 'name images price finalPrice stock variant' });

        return res.status(200).json({ success: true, message: 'Cart updated', cart });

    } catch (error) {
        console.error('Update cart error:', error);
        return res.status(500).json({ success: false, message: 'Failed to update cart', error: error.message });
    }
});

exports.deleteFromCart = catchAsyncErrors(async (req, res) => {
    try {
        const { userId, itemId } = req.body;
        // Validate ObjectIds
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(200).json({ success: false, message: 'Invalid userId or itemId' });
        }
        // Find the user's cart
        const cart = await Card.findOne({ user: userId });
        if (!cart) {
            return res.status(204).json({ success: false, message: 'Cart not found' });
        }
        // Check if item exists
        const itemIndex = cart.items.findIndex(item => item.subProduct.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(204).json({ success: false, message: 'Item not found in cart' });
        }
        // Remove the item
        cart.items.splice(itemIndex, 1);
        // Recalculate total
        cart.totalAmount = cart.items.reduce((total, item) => total + item.quantity * item.price, 0);
        await cart.save();
        await cart.populate({ path: 'items.subProduct', select: 'name images price finalPrice stock variant' });
        return res.status(200).json({ success: true, message: 'Item removed from cart', cart });
    } catch (error) {
        console.error('Delete from cart error:', error);
        return res.status(500).json({ success: false, message: 'Failed to remove item from cart', error: error.message });
    }
});

exports.deleteCard = catchAsyncErrors(async (req, res) => {
    try {
        const { id } = req.params; // Card ID from URL
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid card ID' });
        }
        const card = await Card.findByIdAndDelete(id);
        if (!card) {
            return res.status(404).json({ success: false, message: 'Card not found' });
        }
        res.status(200).json({ success: true, message: 'Card deleted successfully', card });
    } catch (error) {
        console.error('Remove card error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete the card', error: error.message });
    }
});

exports.getAllCard = catchAsyncErrors(async (req, res) => {
    try {
        const cards = await Card.find()
            .populate({ path: 'items.subProduct', populate: { path: 'productId', select: 'productName' } })
            .populate({ path: 'user', select: 'name email phone' });
        console.log("XXXXXXXXXXXXXXXXXX:XXXXX:XXXXXXXXX:XXXX:---", cards)
        res.status(200).json({ success: true, count: cards.length, cards });
    } catch (error) {
        console.error('Get all cards error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch cards', error: error.message });
    }
});

exports.applyCoupon = catchAsyncErrors(async (req, res) => {
    try {
        const { couponCode } = req.body;
        const card = await Card.findOne({ user: req.params.id });
        if (!card) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }
        const coupon = await Coupon.findOne({ couponCode: couponCode })
        if (coupon) {
            const discountAmount = (card.totalAmount * coupon.discount) / 100;
            card.appliedCoupon = { code: couponCode, discount: Math.round(discountAmount), };
            await card.save();
            res.status(200).json({ success: true, message: 'Coupon applied successfully', card });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid coupon code' });
        }
    } catch (error) {
        console.error('Apply coupon error:', error);
        res.status(500).json({ success: false, message: 'Failed to apply coupon', error: error.message });
    }
});


exports.getCardBySubProductId = catchAsyncErrors(async (req, res) => {
    try {
        const { userId, subProductId } = req.body;

        const card = await Card.findOne({ user: userId, "items.subProduct": subProductId });

        if (!card) {
            return res.status(404).json({ success: false, message: 'Card not found' });
        }

        const matchedItem = card.items.find(item => item.subProduct.toString() === subProductId);

        if (!matchedItem) {
            return res.status(404).json({ success: false, message: 'Item not found in card' });
        }

        res.status(200).json({ success: true, message: 'Card item fetched successfully', item: matchedItem, cardId: card._id });
    } catch (error) {
        console.error('Get card by subProduct ID error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch card item by subProduct ID', error: error.message });
    }
});
