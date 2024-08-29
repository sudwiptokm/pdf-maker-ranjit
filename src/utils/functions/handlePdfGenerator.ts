import jsPDF from "jspdf";
import { PDFDocument } from "pdf-lib";

interface TextContent {
	text: string;
	x: number;
	y: number;
}

interface ImageContent {
	src: string;
	x: number;
	y: number;
	width: number;
	height: number;
}

interface PDFContent {
	url: string;
}

export interface DynamicPDFContent {
	texts: TextContent[];
	images: ImageContent[];
	pdfs: PDFContent[];
}

const generateDynamicPDF = async (
	content: DynamicPDFContent,
): Promise<Uint8Array> => {
	// Create a new PDF document
	const doc = new jsPDF();

	// Add text content
	// biome-ignore lint/complexity/noForEach: <explanation>
	content.texts.forEach(({ text, x, y }) => {
		doc.text(text, x, y);
	});

	// Add image content
	// biome-ignore lint/complexity/noForEach: <explanation>
	content.images.forEach(({ src, x, y, width, height }) => {
		doc.addImage(src, "JPEG", x, y, width, height);
	});

	// Create a new PDF document that will combine everything
	const newPdfDoc = await PDFDocument.create();

	// Add the page with text and images
	const [newPage] = await newPdfDoc.copyPages(
		await PDFDocument.load(doc.output("arraybuffer")),
		[0],
	);
	newPdfDoc.addPage(newPage);

	// Fetch and add content from all provided PDFs
	for (const pdfContent of content.pdfs) {
		try {
			const pdfBytes = await fetch(pdfContent.url).then((res) =>
				res.arrayBuffer(),
			);
			const pdfDoc = await PDFDocument.load(pdfBytes);
			const copiedPages = await newPdfDoc.copyPages(
				pdfDoc,
				pdfDoc.getPageIndices(),
			);
			// biome-ignore lint/complexity/noForEach: <explanation>
			copiedPages.forEach((page) => newPdfDoc.addPage(page));
		} catch (error) {
			console.error(`Error adding PDF from ${pdfContent.url}:`, error);
		}
	}

	// Save and return the combined PDF
	return await newPdfDoc.save();
};

export const handleGeneratePDF = async (dynamicContent: DynamicPDFContent) => {
	try {
		const pdfBytes = await generateDynamicPDF(dynamicContent);
		const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(pdfBlob);
		link.download = "generated.pdf";
		link.click();
	} catch (error) {
		console.error("Error generating the combined PDF:", error);
	}
};
