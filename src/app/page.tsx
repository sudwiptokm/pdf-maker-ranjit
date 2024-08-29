// app/page.tsx

"use client";
import jsPDF from "jspdf";
import Image from "next/image";
import { PDFDocument } from "pdf-lib";
import { useRef } from "react";

const Home = () => {
	const pdfRef = useRef<HTMLObjectElement>(null);

	const handleGeneratePDF = async () => {
    const doc = new jsPDF();
  
    doc.text("First Text", 10, 20);
    doc.text("Second Text", 10, 40);
    doc.addImage("/logo.png", "JPEG", 10, 60, 50, 50);
  
    // Fetch existing PDF content
    if (pdfRef.current) {
      const pdfUrl = pdfRef.current.data;
      try {
        const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());
  
        // Load the existing PDF with pdf-lib
        const existingPdfDoc = await PDFDocument.load(existingPdfBytes);
        
        // Create a new PDF document that will combine everything
        const newPdfDoc = await PDFDocument.create();
  
        // Add the page with text and image
        const [newPage] = await newPdfDoc.copyPages(await PDFDocument.load(doc.output('arraybuffer')), [0]);
        newPdfDoc.addPage(newPage);
  
        // Copy all pages from the existing PDF to the new PDF
        const copiedPages = await newPdfDoc.copyPages(existingPdfDoc, existingPdfDoc.getPageIndices());
        // biome-ignore lint/complexity/noForEach: <explanation>
        copiedPages.forEach((page) => newPdfDoc.addPage(page));
  
        // Save the combined PDF
        const pdfBytes = await newPdfDoc.save();
        
        // Create a Blob from the PDF bytes
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
  
        // Create a download link and trigger the download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);
        link.download = 'generated.pdf';
        link.click();
      } catch (error) {
        console.error("Error generating the combined PDF:", error);
      }
    }
  };

	return (
		<div className="flex flex-col items-center justify-center min-h-screen py-2">
			<h1 className="text-2xl font-bold mb-4">Home Page</h1>
			<Image
				src="/logo.png"
				alt="Sample"
				className="w-32 h-32 mb-4"
				width={128}
				height={128}
			/>
			<p className="mb-2">First Text</p>
			<p className="mb-2">Second Text</p>
			{/* Display the existing PDF */}
			<object
				ref={pdfRef}
				data="/pdf.pdf"
				type="application/pdf"
				width="400"
				height="500"
				className="mb-4"
			>
				<p>
					Your browser does not support PDFs.{" "}
					<a href="/pdf.pdf">Download the PDF</a>.
				</p>
			</object>
			{/* Button to generate and download the new PDF */}
			<button
				onClick={handleGeneratePDF}
				className="bg-blue-500 text-white py-2 px-4 rounded"
				type="button"
			>
				Generate and Download PDF
			</button>
		</div>
	);
};

export default Home;
