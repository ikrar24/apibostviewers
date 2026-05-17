"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import ToolsBox from "@/Components/ToolsBox";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import axios from "axios";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { motion } from "framer-motion";
import AnalysisInfo from "@/Components/AnalysisInfo";
import FaqOfAanalysis from "@/Components/FaqOfAanalysis";
import toast from "react-hot-toast";
import ViwesCount from "@/ViewsCount/ViewsCount";

// ⚡ Fancy AI Loader
const AiFancyLoader = ({ text = "Analyzing your YouTube SEO..." }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center mt-10 space-y-3"
  >
    <div className="relative">
      <div
        className="w-[75px] h-[75px] rounded-full border-t-4 border-b-4 border-purple-500 animate-spin"
        style={{
          boxShadow:
            "0 0 20px rgba(168, 85, 247, 0.7), 0 0 40px rgba(79, 70, 229, 0.5)",
        }}
      ></div>
      <div className="absolute inset-0 flex items-center justify-center text-purple-700 text-2xl font-bold">
        🎯
      </div>
    </div>
    <p className="text-purple-900 text-lg font-semibold animate-pulse text-center">
      {text}
    </p>
    <p className="text-gray-700 text-sm animate-pulse">
      Fetching and scoring your content 🔍
    </p>
  </motion.div>
);

function AnalyzingLogic() {
  const [url, setURL] = useState("");
  const [seoData, setSeoData] = useState([]);
  const [overallScore, setOverallScore] = useState(0);
  const [markDownResults, setMarkDown] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // base url 
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:4000" ;
  const isProcessingRef = useRef(false);

  // ✅ Count page view once
  useEffect(() => {
    ViwesCount();
  }, []);

  const getBarColor = (percent) => {
    if (percent < 40) return "#ff4e50";
    if (percent < 70) return "#f9d423";
    return "#00c853";
  };

  const isValidHttpUrl = (input) => {
    try {
      new URL(input);
      return true;
    } catch {
      return false;
    }
  };

  const readSavedYoutubeData = () => {
    const raw = localStorage.getItem("oldYutubeData");
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  };

  const saveToLocal = (data) => {
    try {
      localStorage.setItem("oldYutubeData", JSON.stringify(data));
    } catch (err) {
      console.warn("Failed to save:", err);
    }
  };

  // ✅ Main Submit Function
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (loading || isProcessingRef.current) return;
      isProcessingRef.current = true;

      if (!url || !isValidHttpUrl(url)) {
        setErrorMessage("❌ Please enter a valid YouTube URL including https://");
        isProcessingRef.current = false;
        return;
      }

      setLoading(true);
      setHasResult(false);
      setErrorMessage("");
      setSeoData([]);
      setOverallScore(0);
      setMarkDown("");

      // ✅ Clear existing toast and show one new loading toast
      toast.dismiss();
      const toastId = toast.loading(" Analyzing your video... Please wait...");

      const existingData = readSavedYoutubeData();
      const cleanedData = existingData.filter(Boolean);
      const cached = cleanedData.find((i) => i.url === url);

      try {
        if (cached) {
          const res = await axios.get(
            `${baseUrl}/api/user-youtube-deatails?url=${encodeURIComponent(url)}`,
            {
               withCredentials: true,
              headers: { "x-client-key": process.env.NEXT_PUBLIC_SECRETE_KEY },
            }
          );

          const backendData = res.data?.userYoutubeDeatails;
          console.log(backendData)
          const isUpdated =
            backendData &&
            (backendData.title !== cached.user?.title ||
              backendData.description !== cached.user?.description ||
              JSON.stringify(backendData.tags) !==
                JSON.stringify(cached.user?.tags) ||
              JSON.stringify(backendData.hashtags) !==
                JSON.stringify(cached.user?.hashtags));

          if (!isUpdated && cached.analysis) {
            const seoScores = cached.analysis.seoScores || {};
            const formattedData = [
              { name: "Description", Percent: Number(seoScores.description) || 0 },
              { name: "Title", Percent: Number(seoScores.title) || 0 },
              { name: "Tags", Percent: Number(seoScores.tags) || 0 },
              { name: "Hashtags", Percent: Number(seoScores.hashtags) || 0 },
            ];

            setSeoData(formattedData);
            setOverallScore(Number(seoScores.overall) || 0);
            setMarkDown(cached.analysis.result || "");
            setHasResult(true);
            setLoading(false);
            isProcessingRef.current = false;

            toast.success("SEO Analysis Completed Successfully!", { id: toastId });
            return;
          }

          if (isUpdated) {
            toast.loading("🔄 Changes detected — refreshing SEO analysis", {
              id: toastId,
            });
          }
        }

     const res = await axios.get(
  `${baseUrl}/api/scrape?url=${encodeURIComponent(url)}`,
  {
    withCredentials: true,
    headers: { "x-client-key": process.env.NEXT_PUBLIC_SECRETE_KEY },
  }
);


        const newUser = res.data?.user || {};
        const newAnalysis = res.data?.analysis || {};

        const newData = {
          url,
          savedAt: new Date().toISOString(),
          user: newUser,
          analysis: newAnalysis,
        };

        const deduped = cleanedData.filter((i) => i.url !== url);
        saveToLocal([...deduped, newData]);

        const seoScores = newAnalysis.seoScores || {};
        const formattedData = [
          { name: "Description", Percent: Number(seoScores.description) || 0 },
          { name: "Title", Percent: Number(seoScores.title) || 0 },
          { name: "Tags", Percent: Number(seoScores.tags) || 0 },
          { name: "Hashtags", Percent: Number(seoScores.hashtags) || 0 },
        ];

        setSeoData(formattedData);
        setOverallScore(Number(seoScores.overall) || 0);
        setMarkDown(newAnalysis.result || "");
        setHasResult(true);

        toast.success("SEO Analysis Completed Successfully!", { id: toastId });
      } catch (error) {
        console.error("Error in scrape:", error);
        setErrorMessage("⚠️ Something went wrong while analyzing the video.");
        toast.error("Something went wrong ❌", { id: toastId });
      } finally {
        setLoading(false);
        isProcessingRef.current = false;
      }
    },
    [url, baseUrl, loading]
  );

  const pieData = [
    { name: "Your SEO Score", value: overallScore },
    { name: "Ideal YouTube SEO", value: Math.max(0, 100 - overallScore) },
  ];

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <>
      {/* 🚀 No Toaster Here — it’s global in layout.js */}

      <ToolsBox
        h1="Check Free YouTube SEO Analysis"
        className="items-center justify-start"
        DivWidth="w-full"
      >
        {/* 🔍 Input Form */}
        <form
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4 w-full px-4"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            placeholder="Paste YouTube video URL (include https://)"
            className="w-full max-w-[380px] sm:w-[70%] border border-gray-300 bg-white/70 text-gray-800 placeholder-gray-600 rounded-md p-3 outline-none focus:ring-2 focus:ring-purple-400 transition-all text-base sm:text-lg"
            required
            value={url}
            onChange={(e) => setURL(e.target.value)}
          />
          <button
            type="submit"
            className={`${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#8E2DE2] to-[#4A00E0] hover:shadow-lg hover:scale-[1.02]"
            } text-white font-semibold py-3 px-6 rounded-md shadow-md transition-all cursor-pointer text-base sm:text-lg w-full sm:w-auto`}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </form>

        {/* ✅ Single Centered Loader */}
        {loading && (
          <div className="flex justify-center items-center">
            <AiFancyLoader text="Analyzing your YouTube SEO performance..." />
          </div>
        )}

        {/* ❌ Error */}
        {!loading && errorMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 bg-red-100 text-red-700 border border-red-300 rounded-lg p-4 w-full max-w-2xl text-center font-medium shadow-sm"
          >
            {errorMessage}
          </motion.div>
        )}

        {/* ✅ Results */}
        {!loading && hasResult && (
          <section className="px-2 sm:px-4 py-10 w-full flex flex-col items-center justify-center">
            {/* Bar Chart */}
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-4 sm:p-6">
              <p className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                SEO Performance Overview
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={seoData} barSize={35}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="Percent" radius={[12, 12, 0, 0]}>
                    <LabelList dataKey="Percent" position="top" fill="#333" />
                    {seoData.map((entry, i) => (
                      <Cell key={i} fill={getBarColor(entry.Percent)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="mt-12 w-full max-w-3xl bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col items-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-6 text-center">
                Overall SEO Score
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius="80%"
                    dataKey="value"
                  >
                    <Cell
                      fill={
                        overallScore >= 70
                          ? "#00c853"
                          : overallScore >= 40
                          ? "#f9d423"
                          : "#ff4e50"
                      }
                    />
                    <Cell fill="#ddd" />
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-center text-base sm:text-lg font-semibold mt-2">
                <span className="text-purple-700">
                  {overallScore.toFixed(2)}%
                </span>{" "}
                out of 100%
              </p>
            </div>

            {/* Markdown Result */}
            {markDownResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-5xl bg-white/80 mt-10 rounded-2xl p-8 prose"
              >
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                >
                  {markDownResults}
                </Markdown>
              </motion.div>
            )}
          </section>
        )}
      </ToolsBox>

      <AnalysisInfo />
      <FaqOfAanalysis />
    </>
  );
}

export default AnalyzingLogic;
