import React from 'react';
import './PrivacyPolicy.css';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import myPolicy from "./privacyPolicy.md?raw";

export default function PrivacyPolicy() {
  return (
    <div class="doc-frame">
      {/* Doc layout style (Reuse style from About.css*/}
      <div class="corner top-left"></div>
      <div class="corner top-right"></div>
      <div class="corner bottom-left"></div>
      <div class="corner bottom-right"></div>

      <div class="inner-corner top-left"></div>
      <div class="inner-corner top-right"></div>
      <div class="inner-corner bottom-left"></div>
      <div class="inner-corner bottom-right"></div>

      {/* Main content */}
      <div class="privacyPolicy-content">
        <div class="privacyPolicy-title oleo-script-bold">Privacy Policy</div>
        <div class="privacyPolicy-subContent oxanium-regular">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {myPolicy}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
