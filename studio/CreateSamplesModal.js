import React, { Component, PropTypes } from 'react'
import Studio from 'jsreport-studio'

export default class CreateSamplesModal extends Component {
  static propTypes = {
    close: PropTypes.func.isRequired,
    options: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)

    this.state = {
      creating: false
    }
  }

  close () {
    const { close } = this.props

    close()
  }

  async createSamples (shouldIgnore) {
    const { close } = this.props
    const ignore = shouldIgnore === true

    this.setState({
      creating: true
    })

    await Studio.api.post(`/studio/create-samples`, {
      data: {
        ignore
      }
    })

    this.setState({
      creating: false
    })

    if (ignore) {
      close()
    } else {
      close()

      Studio.reset().catch((e) => {
        console.error(e)
      })
    }
  }

  render () {
    const { creating } = this.state

    return (
      <div>
        <h1>Create samples</h1>
        <p>
          Would you like that we create some default examples for you?
        </p>
        <div>
          <div className='button-bar'>
            <button disabled={creating} className='button confirmation' onClick={() => this.createSamples(true)}>No</button>
            <button disabled={creating} className='button danger' onClick={() => this.createSamples()}>Yes</button>
          </div>
        </div>
      </div>
    )
  }
}
