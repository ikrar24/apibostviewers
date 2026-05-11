"use client";

import ToolsBox from "@/Components/ToolsBox";
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { motion } from "framer-motion";
import { ClipLoader } from "react-spinners";
import TitleInfo from "@/Components/TitleInfo";
import FaqOfTitle from "@/Components/FaqOfTitle";
import toast from "react-hot-toast";
import ViwesCount from "@/ViewsCount/ViewsCount";

function TitleSuggestionLogic() {
  const [videoTopic, setVideoTopic] = useState("");
  const [error, setError] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [markdownText, setMarkdownText] = useState("");
  const [loading, setLoading] = useState(false);
// base url 
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://apibostviewers.onrender.com/" ;
  
// viwes counter 
useEffect(() => {
ViwesCount()
}, [])

  // 🧠 Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
toast.loading("Start Generet Please Wait")
    const count = videoTopic.trim().split(/\s+/).filter(Boolean).length;

    if (count < 5) {
      setError("⚠️ Please enter at least 5 words.");
      return;
    }

    setError("");
    setLoading(true);
    setMarkdownText("");

    try {
      const response = await fetch(`${baseUrl}/api/titleSuggetion`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
           "x-client-key":process.env.NEXT_PUBLIC_SECRETE_KEY,
        },
        body: JSON.stringify({ topic: videoTopic }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      // console.log("✅ API Response:", data);

      // Handle markdown or text response
      let text =
        data?.titleSuggetions ||
        data?.result ||
        data?.choices?.[0]?.message?.content ||
        "No response received.";

      setMarkdownText(text.trim());
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Something went wrong while fetching suggestions.");
    } finally {
      setLoading(false);
      toast.success("Genereted Succesfully")
    }
  };

  // 🧾 Count words live
  const handleInputChange = (e) => {
    const text = e.target.value;
    setVideoTopic(text);
    const count = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(count);
  };

  // 📋 Copy to Clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(markdownText);
    toast.success("Copied to clipboard ✅");
  };

  return (
    <>
      <ToolsBox>
        <form
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4 w-full px-4"
          onSubmit={handleSubmit}
        >
          <label htmlFor="topicInput" className="hidden">
            Video Topic
          </label>

          <input
            id="topicInput"
            type="text"
            value={videoTopic}
            onChange={handleInputChange}
            placeholder="Describe your video topic (min 5 words)"
            className={`w-full max-w-[380px] sm:w-[70%] border ${
              error ? "border-red-500" : "border-gray-300"
            } bg-white/70 text-gray-800 placeholder-gray-600 rounded-md p-3 outline-none focus:ring-2 focus:ring-purple-400 transition-all text-base sm:text-lg`}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#8E2DE2] to-[#4A00E0] hover:shadow-lg hover:scale-[1.02]"
            } text-white font-semibold py-3 px-6 rounded-md shadow-md transition-all cursor-pointer text-base sm:text-lg w-full sm:w-auto`}
          >
            {loading ? "Generating..." : "Check"}
          </button>
        </form>

        {/* 🧮 Word Counter */}
        <p
          className={`mt-2 text-sm sm:text-base text-center ${
            wordCount < 5 ? "text-red-500" : "text-green-600"
          }`}
        >
          Words: {wordCount}/5
        </p>

        {/* ⚠️ Error Message */}
        {error && (
          <p className="text-red-500 text-sm sm:text-base mt-2 text-center">
            {error}
          </p>
        )}

        {/* 🔁 Inline Loader (Under Button) */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center mt-6 gap-2"
          >
            <ClipLoader color="#8E2DE2" size={60} speedMultiplier={1.2} />
            <p className="text-base font-semibold text-gray-700">
             Ganereting Title
            </p>
            <p className="text-sm text-gray-500 animate-pulse">
              Fetching and scoring your content 🔍
            </p>
          </motion.div>
        )}

        {/* ✅ Markdown Result */}
        {markdownText && !loading && (
          <div className="mt-6 p-5 bg-white/80 rounded-lg border border-gray-300 text-left shadow-inner md:w-[85%] mx-auto">
            <h2 className="font-semibold text-gray-800 mb-3 text-xl text-center">
              Generated Titles:
            </h2>

            <div className="text-gray-700 leading-relaxed prose prose-purple max-w-none whitespace-pre-line overflow-x-auto break-words w-full text-sm sm:text-base md:text-[17px] markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  pre: ({ node, ...props }) => (
                    <pre
                      {...props}
                      className="markdown-pre overflow-x-auto rounded-lg p-3 bg-[#1e1e1e] text-white text-sm"
                    />
                  ),
                  code: ({ node, ...props }) => (
                    <code
                      {...props}
                      className="bg-gray-100 text-pink-700 px-1 rounded"
                    />
                  ),
                }}
              >
                {markdownText}
              </ReactMarkdown>
            </div>

            <div className="flex justify-center mt-4">
              <button
                onClick={handleCopy}
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-all"
              >
                Copy Titles
              </button>
            </div>
          </div>
        )}
      </ToolsBox>

      <TitleInfo />
      <FaqOfTitle />
    </>
  );
}

export default TitleSuggestionLogic;
