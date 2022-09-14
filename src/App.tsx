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

import Visualization from './components/Visualization'
import './App.css'
import { sublime } from '@uiw/codemirror-theme-sublime'
import { javascript } from '@codemirror/lang-javascript'
import { useCodeMirror } from '@uiw/react-codemirror'
import { useEffect, useRef, useState } from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import initJsCode from './data/init_code.js'

let query = require('./data/query_response.json')
let data = require('./data/raw_data.json')
let DEPS = [
  'https://code.jquery.com/jquery-2.2.4.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.9.1/underscore-min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/d3/4.13.0/d3.js',
]

const App = () => {
  const extensions = [javascript()]

  const editorDeps = useRef(null)
  const editorJS = useRef(null)
  const editorQueryRes = useRef(null)
  const editorData = useRef(null)

  const [newDeps, setNewDeps] = useState({ current: '', hasChanged: false })
  const [newQuery, setNewQuery] = useState({
    current: '',
    validEntry: '',
    hasChanged: false,
  })
  const [newData, setNewData] = useState({
    current: '',
    validEntry: '',
    hasChanged: false,
  })
  const [newJS, setNewJS] = useState({ current: initJsCode, hasChanged: false })

  const depsContainer = createContainer(editorDeps, DEPS, 3, setNewDeps)
  const jsContainer = createContainer(editorJS, initJsCode, 120, setNewJS, true)
  const queryContainer = createContainer(editorQueryRes, query, 3, setNewQuery)
  const dataContainer = createContainer(editorData, data, 3, setNewData)

  /* eslint-disable */
  useEffect(setContainerValue, [])
  /* eslint-enable */

  const [tabIndex, setTabIndex] = useState(0)
  const [reloadViz, setReloadViz] = useState(true)

  return (
    <>
      <Grid container spacing={0}>
        <Grid
          item
          xs={11}
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h4"
            sx={{ width: '100%', fontWeight: 'bold', color: '#1565c0' }}
          >
            Looker Custom Visualization Builder
          </Typography>
        </Grid>
        <Grid item xs={1}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              p: 1,
              m: 1,
              bgcolor: 'background.paper',
              borderRadius: 1,
            }}
          >
            <Button variant="contained" onClick={runVisualization}>
              RUN
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={0.5}>
        <Grid item xs={6}>
          <Tabs value="jsCode">
            <Tab label="Visualization JS" value="jsCode"></Tab>
          </Tabs>
          <div style={{ padding: '5px' }} ref={editorJS} />
        </Grid>
        <Grid item xs={6}>
          <Tabs value={tabIndex} onChange={onTabClick}>
            <Tab label="Query Response"></Tab>
            <Tab label="Raw Data"></Tab>
            <Tab label="Dependencies"></Tab>
          </Tabs>
          <div
            style={{ padding: '5px' }}
            ref={editorQueryRes}
            hidden={1 === tabIndex || 2 === tabIndex}
          />
          <div
            style={{ padding: '5px' }}
            ref={editorData}
            hidden={0 === tabIndex || 2 === tabIndex}
          />
          <div
            style={{ padding: '5px' }}
            ref={editorDeps}
            hidden={0 === tabIndex || 1 === tabIndex}
          />

          <Typography
            variant="h6"
            color="inherit"
            sx={{ color: '#1976d2', paddingLeft: '5px' }}
          >
            Rendered Visualization
          </Typography>
          <Container maxWidth="xl" component="div" id="visWrapper">
            <div id="vis" style={{ overflow: 'scroll' }} />

            <Visualization
              data={newData.validEntry !== '' ? newData.validEntry : data}
              query={newQuery.validEntry !== '' ? newQuery.validEntry : query}
              jsCode={newJS.current}
              deps={newDeps.current !== '' ? newDeps.current : DEPS}
              reload={reloadViz}
            />
          </Container>
        </Grid>
      </Grid>
    </>
  )

  /** Helper functions */

  function onTabClick(event: any, index: number) {
    setTabIndex(index)
  }

  function getWindowHeight() {
    const { innerHeight } = window
    return innerHeight
  }

  function createContainer(
    container: any,
    obj: any,
    divBy: number,
    varUpdate: any,
    parseVal = false
  ) {
    /* eslint-disable */
    const { setContainer } = useCodeMirror(
      {
        container: container.current,
        extensions,
        value: parseVal ? obj : JSON.stringify(obj, null, 4),
        theme: sublime,
        height: parseVal
          ? `${getWindowHeight() - divBy}px`
          : `${getWindowHeight() / divBy}px`,
        onChange(value, viewUpdate) {
          varUpdate({ current: value, hasChanged: true })
        },
      }
      /* eslint-disable */
    )
    return setContainer
  }

  // Set value for Codemirror container.
  function setContainerValue() {
    depsContainer(editorDeps.current!)
    jsContainer(editorJS.current!)
    queryContainer(editorQueryRes.current!)
    dataContainer(editorData.current!)
  }

  function runVisualization() {
    if (newDeps.hasChanged) {
      try {
        setNewDeps({ current: JSON.parse(newDeps.current), hasChanged: false })
      } catch (e) {
        console.log('Invalid Data. -- Enter valid JSON value for dependencies')
        return
      }
    }

    if (newData.hasChanged) {
      try {
        setNewData({
          ...newData,
          validEntry: JSON.parse(newData.current),
          hasChanged: false,
        })
      } catch (e) {
        console.log('Invalid Raw Data entered')
        return
      }
    }

    if (newQuery.hasChanged) {
      try {
        setNewQuery({
          ...newQuery,
          validEntry: JSON.parse(newQuery.current),
          hasChanged: false,
        })
      } catch (e) {
        console.log('Invalid JSON for Query Response')
        return
      }
    }

    try {
      const iFrame = document.querySelector('iframe')
      iFrame!.remove()
      setReloadViz(reloadViz ? false : true)
    } catch (err) {
      console.log('Using the same dependencies')
    }
  }
}

export default App
