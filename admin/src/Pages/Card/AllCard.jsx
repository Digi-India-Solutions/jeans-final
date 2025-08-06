import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getData } from "../../services/FetchNodeServices";
import jsPDF from "jspdf";

const AllCard = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const response = await getData("api/card/get-all-card");
      if (response.success) setCards(response.cards);
      else console.error("Fetch failed:", response.message);
    } catch (error) {
      console.error("Error fetching cards:", error);
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

 const handleDownloadPDF = (invoiceData, index) => {
  if (!invoiceData) return;

  setIsDownloading(true);
  setDownloadProgress(0);

  const steps = [15, 35, 55, 75, 90, 100];
  let currentStep = 0;

  const interval = setInterval(() => {
    if (currentStep < steps.length) {
      setDownloadProgress(steps[currentStep]);
      currentStep++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        setIsDownloading(false);
        generatePDF(invoiceData, index);
      }, 300);
    }
  }, 400);
};

const generatePDF = (invoiceData, index) => {
  const doc = new jsPDF("p", "pt", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Cart Data", pageWidth / 2, 50, { align: "center" });

  doc.setFontSize(12);
  doc.text("Anibhavi Creations", pageWidth - 40, 70, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("9/7308 Guru Govind Singh Gali", pageWidth - 40, 85, { align: "right" });
  doc.text("(O) 8506854624", pageWidth - 40, 100, { align: "right" });

  // Customer Info
  doc.setFontSize(11);
  const yStart = 130;
  doc.text(`M/S: ${invoiceData.user?.name}`, 40, yStart);
  doc.text(`Phone No: ${invoiceData.user?.phone}`, 40, yStart + 16);
  doc.text(`Email: ${invoiceData.user?.email}`, 40, yStart + 32);

  doc.text(`Order No: ORDER_0${index}`, pageWidth - 40, yStart, { align: "right" });
  doc.text(`Issue Date: ${new Date(invoiceData.createdAt).toLocaleDateString()}`, pageWidth - 40, yStart + 16, { align: "right" });

  // Table Header
  let y = 200;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Design Details:", 40, y);

  y += 20;

  doc.setFontSize(10);
  doc.setFillColor(243, 244, 246); // light gray
  doc.rect(40, y, pageWidth - 80, 25, "F");

  const colX = [45, 90, 250, 330, 410, 490]; // Column start x-positions
  const headers = ["Sr. No.", "Design", "Qty", "Rate", "Amount"];

  headers.forEach((header, i) => {
    doc.text(header, colX[i], y + 17);
  });

  // Table Rows
  y += 25;
  doc.setFont("helvetica", "normal");
  const rowHeight = 20;

  invoiceData.items.forEach((item, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(249, 250, 251); // alternate row color
      doc.rect(40, y, pageWidth - 80, rowHeight, "F");
    }

    const { productName } = item.subProduct?.productId || {};
    const { quantity, price } = item;
    doc.text(`${i + 1}`, colX[0], y + 15);
    doc.text(productName || "", colX[1], y + 15);
    doc.text(`${quantity}`, colX[2], y + 15);
    doc.text(`${price}`, colX[3], y + 15);
    doc.text(`${(price * quantity).toFixed(2)}`, colX[4], y + 15);

    y += rowHeight;
  });

  // Empty rows if less than 8
  const minRows = 8;
  // for (let i = invoiceData.items.length; i < minRows; i++) {
  //   doc.rect(40, y, pageWidth - 80, rowHeight);
  //   y += rowHeight;
  // }

  // Total Amount
  y += 40;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`Total Amount: ₹${invoiceData.totalAmount.toLocaleString()}`, pageWidth - 150, y, { align: "right" });

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  y += 50;
  doc.text("Thank you for your business!", pageWidth / 2, y, { align: "center" });
  doc.text("For queries, contact: +91 8506854624", pageWidth / 2, y + 15, { align: "center" });

  doc.save(`Sales-Order-${index}-${Date.now()}.pdf`);
};
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
                  <th>Download</th>
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
                        <button
                          className="bt edit"
                          onClick={() => handleDownloadPDF(card, index + 1)}
                          style={{ width: "70%" }}
                        >
                          Download <i className="fa-solid fa-download"></i>
                        </button>
                      </td>
                      <td>
                        <button
                          className="bt edit"
                          onClick={() => navigate("/show-detail", { state: { card } })}
                          style={{ width: "70%" }}
                        >
                          View <i className="fa-solid fa-eye"></i>
                        </button>
                        <button className="bt delete" onClick={() => deleteCard(card._id)}>
                          Delete <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center">No carts found.</td>
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
