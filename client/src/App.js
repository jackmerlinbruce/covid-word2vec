import './App.css'
import React, { useState, useEffect } from 'react'
import Axios from 'axios'

import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Chip from '@material-ui/core/Chip'
import SearchIcon from '@material-ui/icons/Search'
import Zoom from '@material-ui/core/Zoom'
import Tooltip from '@material-ui/core/Tooltip'

import { scaleLinear } from 'd3-scale'
import { extent } from 'd3-array'

const useStyles = makeStyles(theme => ({
    root: {
        margin: '0',
        // background: 'black',
        '& > *': {
            // margin: theme.spacing(1),
            // width: '25ch'
        }
    },
    input: {
        padding: theme.spacing(1),
        paddingLeft: '0px',
        paddingTop: '30px',
        backgroundColor: 'white',
        width: '100%',
        position: 'sticky',
        top: '0px',
        zIndex: 1000
    },
    button: {
        margin: theme.spacing(1)
    },
    result: {
        color: '#263238',
        padding: '15px',
        // minWidth: '200px',
        width: 552 / 3 + 'px',
        height: '70px',
        borderRadius: '0px',
        '&:hover': {}
    },
    history: {
        '&:hover': {
            color: '#1e88e5',
            cursor: 'pointer',
            background: 'none',
            backgroundColor: 'none'
        }
    }
}))

function App() {
    const classes = useStyles()
    const [query, setQuery] = useState('antimalarial')
    const [results, setResults] = useState([])
    const [checked, setChecked] = React.useState(true)
    const [disabled, setDisabled] = React.useState(false)
    const [animationDelay, setAnimationDelay] = React.useState(10)
    const [animationDelays, setAnimationDelays] = React.useState([])
    const [colorScale, setColorScale] = React.useState(['#e3f2fd', '#1e88e5'])
    const [history, setHistory] = React.useState(['-', '-', '-', '-'])

    const cScale = scaleLinear()
        .domain(extent(results, r => r.dist))
        .range(colorScale)

    const oScale = scaleLinear()
        .domain([0, 2])
        .range([0.3, 1])

    const getWords = async query => {
        setChecked(false)
        setDisabled(true)
        try {
            setAnimationDelays(results.map((r, i) => i * 0))
        } catch (error) {
            setAnimationDelays([])
            setHistory([])
        }
        const api = `http://localhost:8080?word=${query}&n=21`
        Axios.get(api).then(res => {
            setTimeout(() => {
                setChecked(checked)
                setDisabled(false)
            }, res.data.length * animationDelay)
            setResults(res.data)
            try {
                setAnimationDelays(res.data.map((r, i) => i * animationDelay))
            } catch (error) {
                setAnimationDelays([])
                setHistory([])
            }
        })
        handleHistory(query)
    }

    const handleHistory = word => {
        let newHistory = history
        if (newHistory.length > history.length - 1) {
            newHistory.shift()
        }
        newHistory.push(word)
        setHistory(newHistory)
        console.log(history)
    }

    const openGoogleScholar = word => {
        let url =
            'https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q=%22' +
            word +
            '%22+covid+coronavirus&btnG='
        // let url = `https://www.google.com/search?&q=%22${word}%22+covid+coronavirus&oq=%22test%22+covid+coronavirus`
        window.open(url, '_blank')
    }

    useEffect(() => {
        getWords(query)
    }, [])

    return (
        <div className="App" className={classes.root}>
            <Container maxWidth="sm">
                <Typography variant="h1" gutterBottom>
                    COVID-19 Explorer
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    This was created using the Kaggle corpus of Covid19
                    documents.
                </Typography>

                <br></br>

                <TextField
                    className={classes.input}
                    id="standard-basic"
                    label="Words relating to..."
                    onInput={e => setQuery(e.target.value)}
                    value={query}
                />

                <br></br>

                <Button
                    className={classes.button}
                    variant="contained"
                    onClick={() => getWords(query)}
                    disabled={disabled}
                >
                    Search
                </Button>

                <br></br>

                {results.length
                    ? results.map((r, i) => {
                          let delay = i * animationDelay + 'ms'
                          return (
                              <>
                                  <Zoom
                                      in={checked}
                                      style={{
                                          transitionDelay: animationDelays[i]
                                      }}
                                  >
                                      <Chip
                                          className={classes.result}
                                          label={r.word}
                                          onClick={e => {
                                              getWords(e.target.innerText)
                                              setQuery(e.target.innerText)
                                          }}
                                          onDelete={e =>
                                              openGoogleScholar(
                                                  e.target.parentElement
                                                      .firstChild.innerText
                                              )
                                          }
                                          deleteIcon={<SearchIcon />}
                                          style={{
                                              backgroundColor: cScale(r.dist)
                                          }}
                                      />
                                  </Zoom>
                              </>
                          )
                      })
                    : null}

                <br></br>

                {history.map((h, i) => {
                    return (
                        <Button
                            className={classes.history}
                            style={{
                                opacity: oScale(i),
                                fontWeight: i == history.length - 1 ? 700 : 400
                            }}
                            onClick={e => {
                                getWords(e.target.innerText.toLowerCase())
                                setQuery(e.target.innerText.toLowerCase())
                            }}
                            disabled={disabled}
                        >
                            {h}
                        </Button>
                    )
                })}

                <br></br>

                <Typography variant="h2" gutterBottom>
                    How does this work?
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    No single researcher has the time to read through all the
                    COVID-19 literature out there. This applet squashes down all
                    47,000 COVID-19 research papers and then looks at how those
                    different words are connected. <br />
                    <br /> It's quite possible there may be connections that
                    exist within the corpus that are not apparent to the
                    researchers. This applet allows reveals some of those
                    connections. <br />
                    <br /> This applet is not intended to be a miracle cure, but
                    rather a gentle guide to aid snowed under researchers.
                    Perhaps there is a treatment compound you haven't considered
                    yet?
                </Typography>
            </Container>
        </div>
    )
}

export default App
