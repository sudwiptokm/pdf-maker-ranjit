"use client";
import {
	type DynamicPDFContent,
	handleGeneratePDF,
} from "@/utils/functions/handlePdfGenerator";
import Image from "next/image";
import type React from "react";
import { useState } from "react";

const dynamicContent: DynamicPDFContent = {
	texts: [
		{ text: "First Text", x: 10, y: 20 },
		{ text: "Second Text", x: 10, y: 40 },
	],
	images: [{ src: "/logo.png", x: 10, y: 60, width: 50, height: 50 }],
	pdfs: [{ url: "/pdf.pdf" }, { url: "/secondpdf.pdf" }],
};

const Home: React.FC = () => {
	const [contentItems, setContentItems] =
		useState<DynamicPDFContent>(dynamicContent);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen py-2">
			<h1 className="text-2xl font-bold mb-4">Dynamic PDF Generator</h1>

			{contentItems.texts.map((item, index) => (
				<p key={item.text}>{item.text}</p>
			))}

			{contentItems.images.map((item, index) => (
				<Image
					key={item.src}
					src={item.src}
					alt="Content"
					width={100}
					height={100}
				/>
			))}

			<div className="flex flex-col gap-4">
				{contentItems.pdfs.map((item, index) => (
					<object
						key={item.url}
						data={item.url}
						type="application/pdf"
						width="400"
						height="200"
					>
						<p>
							Your browser does not support PDFs.{" "}
							<a href={item.url}>Download the PDF</a>.
						</p>
					</object>
				))}
			</div>

			<button
				onClick={() => handleGeneratePDF(dynamicContent)}
				className="bg-blue-500 text-white py-2 px-4 rounded"
				type="button"
			>
				Generate and Download PDF
			</button>
		</div>
	);
};

export default Home;
