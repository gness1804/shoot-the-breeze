import React, { Component } from 'react';
import firebase, { reference, signIn} from '../firebase';
import {pick, map, extend, uniq, filter} from 'lodash';
import { _ } from 'underscore';
import SubmitMessage from './submit-message.js';
import ClearInput from './clear-input.js';
import LogInButton from './login-button.js';
import LogOutButton from './logout-button.js';
import FilterInputField from './filter-input-field.js';
import ChatMaster from './chatMaster.js';
import SortUp from './sort-up.js';
import SortDown from './sort-down.js';
import moment from 'moment';

export default class Application extends Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      newMessage: '',
      newMessageLength: '',
      user: '',
      currentUser: '',
      submitButtonDisabled: true,
      clearButtonDisabled: true,
      search: '',
      filteredMessages: []
    };

  } //end of constructor

  //core built-in functions

  componentDidMount(){
    this.loadMessages();
    //populate filteredMessages on load

  } //end of componentDidMount

  //regular functions

  assignNewMessageLength(item){
    this.setState({newMessageLength: item});
  }

  clearInputField(){
    this.clearMessageInput();
    this.disableButtons();
    this.resetNewMessageState();
    this.resetNewMessageLengthState();
  }

  clearMessageInput(){
    this.refs.messageEntryField.innerText = '';
  }

  detectFieldContent(e){
    if (e.target.value !== '') {
      this.enableButtons();
    }
    else {
      this.disableButtons();
      this.resetNewMessageLengthState();
    }
  } //end of detectFieldContent

  disableButtons(){
    this.setState({submitButtonDisabled: true});
    this.setState({clearButtonDisabled: true});
  }

  enableButtons(){
    this.setState({submitButtonDisabled: false});
    this.setState({clearButtonDisabled: false});
  }

  findMatchingMessages(searchThing) {
    let result = this.state.messages.filter(
        (message) => {
          return message.body.indexOf(searchThing.search) !== -1;
        }
    );
    this.setStateForFilteredMessages(result);
  } //end of findMatchingMessages

  handleInputChange(e){

    const items = {
      thereIsANewMessage: e.target.value.length > 0,
      messageIsTooLong: e.target.value.length >= 140
    };

    this.makeNewMessageTheInputValue(e);
    this.assignNewMessageLength(e.target.value.length);

    if (items.thereIsANewMessage) {
      this.enableButtons();
    }

    if (items.messageIsTooLong) {
      this.setState({submitButtonDisabled: true});
      this.styleCharCounterRed();
    }
    else {
      this.styleCharCounterWhite();
    }

  } //end of handleInputChange

  hideClearMessageButton(){
    document.querySelector('.clear-message-button').setAttribute('hidden', 'true');
  }

  hideLogInButton(){
    document.querySelector('.login-button').setAttribute('hidden', 'true');
  }

  hideLogOutButton(){
    document.querySelector('.logout-button').setAttribute('hidden', 'true');
  }

  hideMessageEntryField(){
    document.getElementById('message-entry-field').setAttribute('hidden', 'true');
  }

  hideSubmitMessageButton(){
    document.querySelector('.submit-message-button').setAttribute('hidden', 'true');
  }

  initFirebase(){
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
  } // end of initFirebase

  isUserSignedIn(){
    if (this.auth.currentUser) {
      return true;
    }
  } //end of isUserSignedIn

  loadMessages(){
    reference.limitToLast(25).on('value', (snapshot) =>  {
      let messagesReturned = this.returnArray(snapshot.val());
        this.setFilteredMessagesStateToMessages(messagesReturned);
        this.setMessageStateToFirebaseData(messagesReturned);
    }); //end of snapshot function
  } //end of loadMessages

  makeNewMessageTheInputValue(e){
    this.setState({newMessage: e.target.value});
  }

  onAuthStateChanged(user){

    const items = {
      email: user.email,
      loggedInAs: document.querySelector('.logged-in-as'),
      userName: user.displayName
    };

    if (user) {
      //user is logged in
      this.showLoggedInUser(items.loggedInAs,   items.userName,items.email);
      this.showClearMessageButton();
      this.showLogOutButton();
      this.showMessageEntryField();
      this.showSubmitMessageButton();
      this.hideLogInButton();
    }

    else {
      //user is not logged in
      this.hideClearMessageButton();
      this.hideLogOutButton();
      this.showLogInButton();
      this.hideMessageEntryField();
      this.hideSubmitMessageButton();
    }

  } //end of onAuthStateChanged

  resetNewMessageLengthState(){
    this.setState({
      newMessageLength: ''
    });
  } //end of resetNewMessageLengthState

  resetNewMessageState(){
    this.setState({
      newMessage: '',
    });
  } //end of resetNewMessageState

  returnArray(snapshots){
    let array = [];
    if (snapshots) {
      let fullArray = Object.keys(snapshots).map((each)=>{
        array.push(snapshots[each]);
      });
    }
    return array;
  } //end of returnArray

  saveMessage(){
    let messageExists = this.state.newMessageLength > 0;
    let messageIsNotTooLong = this.state.newMessageLength < 140;
    let userIsSignedIn = this.isUserSignedIn();

    const newMsgObj = {
      user: this.auth.currentUser.displayName,
      body: this.state.newMessage,
      photo: this.auth.currentUser.photoURL,
      email: this.auth.currentUser.email,
      time: moment().format("MMMM D, h:mm a "),
      id: Date.now(),
    };

    if ( messageExists && messageIsNotTooLong && userIsSignedIn) {
      //user is signed in
      reference.push(newMsgObj);
      this.resetNewMessageState();
      this.setStateToUser(this.auth.currentUser);
      this.disableButtons();
      this.loadMessages();
      this.resetNewMessageLengthState();
    } //end of if statement

  } //end of saveMessage

  setMessageStateToFirebaseData(messagesReturned){
    this.setState({
      messages: messagesReturned,
    });
  } //end of setMessageStateToFirebaseData

  setFilteredMessagesStateToMessages(messagesReturned){
    this.setState({
      filteredMessages: messagesReturned,
    });
  }

  setStateForFilteredMessages(item){
    this.setState({filteredMessages: item});
  }

  setStateToUser(currentUser){
    this.setState({
      user: currentUser.displayName,
    });
  }

  showClearMessageButton(){
    document.querySelector('.clear-message-button').removeAttribute('hidden');
  }

  showLoggedInUser(loggedInAs, userName, email){
      loggedInAs.textContent = "Logged in as " + userName + " (" + email + ")" + ".";
  }

  showLogInButton(){
    document.querySelector('.login-button').removeAttribute('hidden');
  }

  showLogOutButton(){
    document.querySelector('.logout-button').removeAttribute('hidden');
  }

  showMessageEntryField(){
    document.getElementById('message-entry-field').removeAttribute('hidden');
  }

  showSubmitMessageButton(){
    document.querySelector('.submit-message-button').removeAttribute('hidden');
  }

  signIn(){
    let provider = new firebase.auth.GoogleAuthProvider();
    this.auth.signInWithPopup(provider);
  } //end of signIn

  signOut(){
    const warning = confirm("Are you sure you want to log out?");
    if (warning) {
      this.auth.signOut();
      window.location.reload();
    }
  } //end of signOut

  sortDown(){
    this.loadMessages();
    this.sortMostRecentAtBottom();
  }

  sortMostRecentAtBottom(){
    this.state.messages.sort((a, b)=>{
      return a.id - b.id;
    });
  }

  sortUp(){
    this.loadMessages();
    let reversed = this.state.messages.reverse();
    this.setStateForFilteredMessages(reversed);
  }

  styleCharCounterRed(){
    this.refs.characterCounterOutput.style.color = "red";
  }

  styleCharCounterWhite(){
    this.refs.characterCounterOutput.style.color = "white";
  }

  updateSearch(event) {
    let searchValue = {search: event.target.value.substr(0, 20)};
    this.setState(searchValue);
    this.findMatchingMessages(searchValue);
  }

  render(){
    let filteredMessages = this.props.messages;
    return (
      <div onLoad={this.initFirebase()}>
        <header>
          <h2 id="page-main-title">Shoot the Breeze</h2>
          <FilterInputField
          handleChange = {this.updateSearch.bind(this)}
          value={this.state.search}/>
          <div className="buttons-container-header">
            <SortUp handleClick={()=>this.sortUp()}/>
            <SortDown handleClick={()=>this.sortDown()}/>
          </div>
        </header>
        <div className="body">
          <ChatMaster messages={this.state.filteredMessages}/>
        </div>
        <footer>
          <div className="footer-top-component">
            <p className="logged-in-as"></p>
          </div>
          <div className="footer-bottom-component">
            <LogInButton handleClick={()=>this.signIn()}/>
            <LogOutButton handleClick={()=>this.signOut()}/>
            <input id="message-entry-field"
                   ref="messageEntryField"
                   type="text"
                   placeholder="Message"
                   onChange={this.handleInputChange.bind(this)}
                   value={this.state.newMessage}
                   onKeyPress={this.detectFieldContent.bind(this)} onBlur={this.detectFieldContent.bind(this)} hidden>
            </input>
            <p
             id="character-counter-output"
             ref="characterCounterOutput">
              {this.state.newMessageLength}
            </p>
            <div className="buttons-container-footer">
              <SubmitMessage handleClick={()=>this.saveMessage()} isDisabled={this.state.submitButtonDisabled}/>
              <ClearInput handleClick={()=>this.clearInputField()} isDisabled={this.state.clearButtonDisabled}/>
            </div>
          </div>
        </footer>
      </div>
    )
  }

} //end of Application


module.exports = Application;
