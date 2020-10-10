import React, { useState, useEffect } from 'react'
import { fetchAllSlackUsers, notifySlackUser, SlackUser } from '../../services/slackUserService'
import { annotateImage } from '../../services/googleVisionService'
import logo from '../../assets/images/logo96.png'
import magnifyingGlassIcon from '../../assets/images/magnifying-glass.png'
import Webcam from 'react-webcam'
import Fuse from 'fuse.js'
import HashLoader from 'react-spinners/HashLoader'
import ls from 'local-storage'
import { Flyout } from 'pivotal-ui/react/flyout'

import './home.scss'

const HomePage = () => {
    const [slackUsers, setSlackUsers] = useState([{} as SlackUser])
    const [searchName, setSearchName] = useState('')
    const [selectedSlackUser, setSelectedSlackUser] = useState({} as SlackUser)
    const [visionLoading, setVisionLoading] = useState(false)
    const [visionNoResults, setVisionNoResults] = useState(false)

    const [showSlackFlyout, setShowSlackFlyout] = useState(false)
    const [slackOptionIsSingle, setSlackOptionIsSingle] = useState(false)
    const [slackOptionIsParcel, setSlackOptionIsParcel] = useState(false)
    const [slackOptionAdditionalText, setSlackOptionAdditionalText] = useState('')

    useEffect(() => {
        const localSlackUsers = ls('slackUsers') as unknown as SlackUser[]
        const localSlackUsersExpired = ls('slackUsersExpire') !== null && new Date(ls('SlackUsersExpire') as unknown as Date).valueOf() > new Date().valueOf()
        console.log(localSlackUsersExpired)
        if (!localSlackUsers || localSlackUsersExpired) {
            fetchAllSlackUsers().then(slackUsersResponse => {
                setSlackUsers(slackUsersResponse)
                ls('slackUsers', slackUsersResponse)
                ls('slackUsersExpire', new Date(Date.now() + (3600 * 1000 * 24)))
            })
        } else {
            setSlackUsers(localSlackUsers)
        }
    }, [])

    const webcamRef = React.useRef(null);
    const captureCamera = React.useCallback(
        () => {
            if (webcamRef !== null) {
                setVisionLoading(true)
                const base64ImageSrc = webcamRef.current.getScreenshot();
                const textAnnotationsResults: string[] = []
                annotateImage(base64ImageSrc).then((jsonResult) => {
                    console.log(jsonResult)
                    jsonResult.responses.map(text => {
                        if (text) {
                            text.textAnnotations.map(description => {
                                textAnnotationsResults.push(description.description)
                                console.log(textAnnotationsResults)
                            })
                        } else {
                            setVisionNoResults(true)
                            console.log('No results found for scanned image')
                        }
                    })
                }).catch((err) => {
                    setVisionNoResults(true)
                    console.log(err)
                }).finally(() => {
                    setUserNameFromAnnotations(textAnnotationsResults)
                    setVisionLoading(false)
                    setTimeout(() => { setVisionNoResults(false) }, 4000)
                })
            }
        },
        [webcamRef]
    );

    const setUserNameFromAnnotations = (textAnnotations: string[]) => {
        if (textAnnotations) {
            textAnnotations.shift()
        }
        setSearchName(textAnnotations.join(' '))
    }

    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchName(e.currentTarget.value)
    }

    const fuseSlackUsers = new Fuse(slackUsers, {
        keys: ['name', 'real_name']
    })

    return (
        <div className="home">
            {slackUsers.length > 1 ?
                <>
                    <div className="search-bar">
                        <img className='search-bar__logo' src={logo} alt='' />
                        <div className="search-bar__search">
                            <input onChange={(e) => handleSearchInput(e)} placeholder='Search for a slack user'></input>
                            <img className='search-bar__search__icon' src={magnifyingGlassIcon} alt='' />
                        </div>
                    </div>

                    <div className='users'>
                        {searchName ? fuseSlackUsers.search(searchName).map((searchedUser: SlackUser) =>
                            <div key={searchedUser.id} className="users__card"
                                onClick={() => { setSelectedSlackUser(searchedUser); setShowSlackFlyout(true); }}>{searchedUser.name}</div>
                        ) : <p className="users__empty">Search for a slack user or scan a parcel</p>}

                    </div>
                    {visionNoResults && <div className="scan-no-results">No words detected in image</div>}
                    <div className="scan-box">
                        <Webcam ref={webcamRef}
                            screenshotFormat="image/jpeg" />
                    </div>

                    <div className="scan-button-container">
                        {visionLoading ? <button className="is-disabled">
                            <p>Scan text</p>
                            <HashLoader color={"#313c53"} size={25} />
                        </button> : <button onClick={captureCamera}>Scan text</button>}
                    </div>

                    <Flyout {...{
                        animationDuration: 300,
                        show: showSlackFlyout,
                        header: <div>Send a slack notification to <span>{selectedSlackUser.name}</span></div>,
                        headerClassName: 'slack-flyout__header',
                        bodyClassName: 'slack-flyout__body',
                        width: '100%',
                        onHide: () => setShowSlackFlyout(false)
                    }
                    } >
                        <div className="slack-flyout__body-container">
                            <div className="slack-flyout__options">
                                <div className="slack-flyout__checkboxes">
                                    <div>
                                        <label">
                                            <input type="checkbox" onChange={() => setSlackOptionIsParcel(!slackOptionIsParcel)} />
                                            <span>Parcel</span>
                                        </label>
                                    </div>
                                    <div>
                                        <label>
                                            <input type="checkbox" onChange={() => setSlackOptionIsSingle(!slackOptionIsSingle)} />
                                            <span>Single Item</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="slack-flyout__comments">
                                    <label htmlFor="additional-comments">
                                        Additional comments:
			                        </label>
                                    <textarea id="additional-comments" name="additional-comments" placeholder="Enter comments here"
                                        onChange={(e) => setSlackOptionAdditionalText(e.currentTarget.value)} />
                                </div>
                            </div>
                            <button onClick={() =>
                                notifySlackUser('SLACK-ID', { isSingle: slackOptionIsSingle, isParcel: slackOptionIsParcel, additionalText: slackOptionAdditionalText })}>Send notification</button>
                        </div>
                    </Flyout >
                </>
                : <div className="home__loading">
                    <HashLoader color={"#313c53"} />
                    <p>Fetching slack users</p>
                </div>}
        </div>
    )
}

export default HomePage