import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { getData } from "../../services/FetchNodeServices";
import { useNavigate } from "react-router-dom";

const AllCard = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await getData('api/card/get-all-card');
      console.log("DDDDDDDDDDD",response)
      if (response.success) {
        setCards(response.cards);
      } else {
        console.error("Failed to fetch cards:", response.message);
      }
    } catch (error) {
      console.error("Error fetching card data:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCard = async (cardId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this cart!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await getData(`api/card/delete-card/${cardId}`);
        if (response.success) {
          Swal.fire("Deleted!", "The cart has been deleted.", "success");
          fetchCards();
        } else {
          Swal.fire("Failed!", response.message || "Delete failed", "error");
        }
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire("Error!", "Something went wrong!", "error");
      }
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  return (
    <>
      <div className="bread">
        <div className="head">
          <h4>All Carts</h4>
        </div>
      </div>

      <section className="main-table">
        {loading ? (
          <p className="text-center">Loading cards...</p>
        ) : (
          <div className="table-responsive mt-4">
            <table className="table table-bordered table-striped table-hover">
              <thead>
                <tr>
                  <th>Sr.No.</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Coupon</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cards.length > 0 ? (
                  cards.map((card, index) => (
                    <tr key={card._id}>
                      <td>{index + 1}</td>
                      <td>{card.user?.name}</td>
                      <td>{card.user?.email}</td>
                      <td>{card.user?.phone}</td>
                      <td>{card.items?.length} items</td>
                      <td>₹{card.totalAmount}</td>
                      <td>
                        {card.appliedCoupon?.code
                          ? `${card.appliedCoupon.code} (-₹${card.appliedCoupon.discount})`
                          : "N/A"}
                      </td>
                      <td>{new Date(card.createdAt).toLocaleString()}</td>

                      <td>
                        <button className="bt edit" onClick={() => navigate('/show-detail', { state: { card } })} style={{ width: '70%' }}>
                          View Details <i className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          onClick={() => deleteCard(card._id)}
                          className="bt delete"
                        >
                          Delete <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center">
                      No carts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
};

export default AllCard;
