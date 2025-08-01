import React from 'react';
import './CopyrightPolicy.css';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import myCopyright from "./copyrightPolicy.md?raw";

export default function CopyrightPolicy() {
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
      <div class="copyrightPolicy-content">
        <div class="copyrightPolicy-title oleo-script-bold">Copyright Policy</div>
        <div class="copyrightPolicy-subContent oxanium-regular">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {myCopyright}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
