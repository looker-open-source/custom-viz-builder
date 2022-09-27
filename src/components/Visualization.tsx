/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect } from 'react'
import { Chatty } from '@looker/chatty'

interface Viz {
  data: string
  query: string
  deps: any
  jsCode: string
  reload: boolean
}

const Visualization = ({ data, query, deps, jsCode, reload }: Viz) => {
  useEffect(loadvisualization, [reload])

  return (
    <>
      <div></div>
    </>
  )

  function loadvisualization() {
    const visEl = document.getElementById('visWrapper')

    const chatter = Chatty.createHostFromSource(
      `
    <html>
      <head>
          ${deps
            .map((dep: any) => `<script src="${escapeHtml(dep)}"></script>`)
            .join('')}

          <style type="text/css">
                  html, body, #vis {
                  height: calc(100% - 20px);
                  margin: 0;
                  padding: 0;
                  border: none;
                }

                #vis {
                  height: 100%;
                  width: calc(100% - 20px);
                  margin: 10px;
                  border: none;
                }
          </style>

          <script type="text/javascript" src="https://looker-open-source.github.io/custom-viz-builder/vizsetup.js"></script>

          <script type="text/javascript" src="https://looker-open-source.github.io/custom-viz-builder/sandy.js"></script>

      </head>

        <body>
          <div id="vis"></div>
          
        </body>
        <script async type="text/javascript">${escapeScript(jsCode)}</script>
    </html>
  `
    )
      .appendTo(visEl!)
      .build()
      .connect()

    chatter
      .then((host: any) => {
        host.send('Create', null, {})
        host.send('UpdateAsync', data, null, {}, query, '')
      })
      .catch(console.error)
  }

  function escapeHtml(unsafe: string) {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  function escapeScript(raw: string) {
    return raw
      .replace(/<!--/g, '<\\!--')
      .replace(/<script/g, '<\\script')
      .replace(/<\/script/g, '<\\/script')
  }
}

export default Visualization
