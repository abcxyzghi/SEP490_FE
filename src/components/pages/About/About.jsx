import React from 'react';
import './About.css';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import myDoc from "./about.md?raw";  // with vite raw import

export default function About() {
  return (
    <div class="doc-frame">
      {/* Doc layout style */}
      <div class="corner top-left"></div>
      <div class="corner top-right"></div>
      <div class="corner bottom-left"></div>
      <div class="corner bottom-right"></div>

      <div class="inner-corner top-left"></div>
      <div class="inner-corner top-right"></div>
      <div class="inner-corner bottom-left"></div>
      <div class="inner-corner bottom-right"></div>

      {/* Main content */}
      <div class="about-content">
        <div class="about-title oleo-script-bold">About Us</div>
        <div class="about-subContent oxanium-regular">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {myDoc}
          </ReactMarkdown>
        </div>
      </div>
    </div>

  )
}
