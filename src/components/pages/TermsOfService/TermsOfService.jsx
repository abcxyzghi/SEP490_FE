import React from 'react';
import './TermsOfService.css';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import myTerms from "./termsOfService.md?raw";

export default function TermsOfService() {
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
      <div class="termOfService-content">
        <div class="termOfService-title oleo-script-bold">Terms Of Service</div>
        <div class="termOfService-subContent oxanium-regular">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {myTerms}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
