import React, { Component } from 'react';

class NewMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
    };
  }
  updateMessage(e){
    const message = e.target.value;
    this.setState({ message });
  }

  submitForm(e){
    e.preventDefault();
    const { message } = this.state;
    this.props.submitMessage(message);
    this.setState({ message: '' });
  }
  render () {
    return (
      <form onSubmit={e => this.submitForm(e)}>
        <input
          id="message-entry-field"
          type="text"
          placeholder="Message"
          onChange={e => this.updateMessage(e)}
          value={this.state.message}
        />
        <button className="new-message-button" type="Submit" >Submit Message</button>
        <button className="clear-message-button" disabled>Clear Message</button>
      </form>
    );
  }
}

module.exports = NewMessage;
