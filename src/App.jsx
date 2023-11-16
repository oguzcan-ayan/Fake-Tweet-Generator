import React, {useState, createRef, useEffect} from 'react';
import './App.scss';
import { ReplyIcon, RetweetIcon, LikeIcon, ShareIcon, /* VerifiedIcon */ } from './components/icons';
import { AvatarLoader } from './components/loaders';
import { useScreenshot } from 'use-react-screenshot';
import { language } from './components/language';
import { MdOutlineVerified } from "react-icons/md";

function App() {

  function convertImagetoBase64(url, callback, outputFormat) {
    var canvas = document.createElement("CANVAS");
    var ctx = canvas.getContext("2d");
    var img = new Image;
    img.crossOrigin = 'Anonymous';
    img.onload = function(){
      canvas.height = img.height;
      canvas.width = img.width;
      ctx.drawImage(img, 0, 0);
      var dataURL = canvas.toDataURL(outputFormat || "image/png");
      callback.call(this, dataURL);
      //clean up
      canvas = null;
    };
      img.src = url;
  }
  

  const tweetFormat = tweet => {
    tweet = tweet.replace(/@([\w]+)/g, '<span>@$1</span>')
                 .replace(/#([\wçğıöşüÇĞIÖŞÜ]+)/gi, '<span>#$1</span>')
                 .replace(/(https?:\/\/[\w\.\/]+)/, '<span>$1</span>')
    return tweet;
  };

  const formatNumber = number => {

    if(!number){
      number = 0;
    }

    if(number < 1000){
      return number;
    }

    number /= 1000;
    console.log(number);
    number = String(number).split(".");
    console.log(number);
    return number[0] + (number[1] > 100 ? ',' + number[1].slice(0, 1) + 'B' : 'B')
  };

    const [name, setName] = useState();
    const [username, setUsername] = useState();
    const [isVerified, setIsVerified] = useState(0);
    const [tweet, setTweet] = useState();
    const [avatar, setAvatar] = useState();
    const [retweets, setRetweets] = useState(0);
    const [quoteTweets, setQuoteTweets] = useState(0);
    const [likes, setLikes] = useState(0);
    const [lang, setLang] = useState('tr');
    const [langText, setLangText] = useState();
    const [image, takeScreenshot] = useScreenshot();
    const tweetRef = createRef(null);
    const downloadRef = createRef();
    const getTweetImage = () => takeScreenshot(tweetRef.current);

    useEffect(() => {
      setLangText(language[lang]);
    }, [lang]);

    useEffect( () => {
      /* if(image){
      downloadRef.current.click();
      } */
      console.log(image);
    }, [image]);

    const avatarHandle = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.addEventListener("load", function(){ 
          setAvatar(this.result);
      });

      reader.readAsDataURL(file);
    };

    const fetchTwitterInfo = () => {
        fetch(`https://typeahead-js-twitter-api-proxy.herokuapp.com/demo/search?q=${username}`)
        .then(res => res.json())
        .then(data =>
        {
          const twitter = data[0];
          console.log(twitter);
          convertImagetoBase64(twitter.profile_image_url_https, function(base64Image){
            setAvatar(base64Image);
          });
          setName(twitter.name);
          setUsername(twitter.screen_name);
          setTweet(twitter.status.text);
          setRetweets(twitter.status.retweet_count);
          setLikes(twitter.status.favourite_count);
        });
    };

  return (
    <>
    <div className='tweet-settings'>
      <h3>{langText?.settings}</h3>
      <ul>
        <li>
          <label htmlFor='name'>{langText?.name}</label>
          <input 
            type="text"
            id='name'
            className='input-settings'
            value={name}
            onChange={(e) => setName(e.target.value)}/>
        </li>

        <li>
        <label htmlFor='username'>{langText?.username}</label>
          <input 
            type="text"
            id='username'
            className='input-settings'
            value={username}
            onChange={(e) => setUsername(e.target.value)}/>
        </li>

        <label htmlFor='tweet'>Tweet</label>
        <textarea 
          id='tweet'
          className='textarea-settings'
          maxLength={290}
          value={tweet} 
          onChange={(e) => setTweet(e.target.value)}
          />

        <li>
        <label htmlFor='avatar'>Avatar</label>
          <input 
            type="file"
            id='avatar'
            className='input-settings'
            onChange={avatarHandle}/>
        </li>

        <li>
        <label htmlFor='retweets'>Retweets</label>
          <input 
            type="number"
            id='retweets'
            className='input-settings'
            value={retweets}
            onChange={(e) => setRetweets(e.target.value)}/>
        </li>

        <li>
        <label htmlFor='quoteTweets'>{langText?.quoteTweets}</label>
          <input 
            type="number"
            id='quoteTweets'
            className='input-settings'
            value={quoteTweets}
            onChange={(e) => setQuoteTweets(e.target.value)}/>
        </li>

        <li>
        <label htmlFor='likes'>{langText?.like}</label>
          <input 
            type="number"
            id='likes'
            className='input-settings'
            value={likes}
            onChange={(e) => setLikes(e.target.value)}/>
        </li>

        <li>
        <label>{langText?.verifiedAccount}</label>
          <select 
          onChange={(e) => setIsVerified(e.target.value)}
          defaultValue={isVerified}>
            <option value="1">{langText?.verifiedAccountYes}</option>
            <option value="0">{langText?.verifiedAccountNo}</option>
          </select>
        </li>

        <button className='create-tweet' onClick={getTweetImage}>{langText?.createButton}</button>

        {image && <button className='download-tweet-url'>
          <a /* ref={downloadRef} */ href={image} download="fake-tweet.png">{langText?.downloadTweet}</a>
        </button>}
      </ul>

    </div>

      <div className='tweet-container'>
        <div className='app-language'>
          <span onClick={() => setLang('tr')} className={lang === 'tr' && "active"}>{langText?.changeLangTr}</span>
          <span onClick={() => setLang('en')} className={lang === 'en' && "active"}>{langText?.changeLangEn}</span>
        </div>
        <div className='fetch-info'>
          <input 
          type="text" 
          value={username}
          placeholder={langText?.placeholderUsernameEnter}
          onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={fetchTwitterInfo} className='fetch-info-btn'>{langText?.infoButton}</button>
        </div>

        <div className='tweet' ref={tweetRef}>
          <div className='tweet-owner'>
           {avatar && <img src={avatar} /> || <AvatarLoader />}
            <div>
              <div className='name-and-verified'>
                <span className='name'>{name || langText?.name}</span>
                {isVerified == 1 && <MdOutlineVerified />}
              </div>
              <div className='username'>@{username || langText?.username}</div>
            </div>
          </div>
          <div className='tweet-content'>
            <p dangerouslySetInnerHTML={{
              __html: 
              tweet && tweetFormat(tweet) || langText?.exampleTweet}}></p>
          </div>
          <div className='tweet-stats'>
            <span>
              <b>{formatNumber(retweets)}</b> Retweet
            </span>
            <span>
              <b>{formatNumber(quoteTweets)}</b> {langText?.quoteTweets}
            </span>
            <span>
              <b>{formatNumber(likes)}</b> {langText?.like}
            </span>
          </div>
          <div className='tweet-actions'>
            <span className='reply-icon'><ReplyIcon color="#6e767d" /></span>
            <span className='retweet-icon'><RetweetIcon color="#6e767d" /></span>
            <span className='like-icon'><LikeIcon color="#6e767d" /></span>
            <span className='share-icon'><ShareIcon color="#6e767d" /></span>
          </div>
        </div>
      </div>

     {/*  <div>
        Maalesef ki bilgileri çek kısmında API olarak baz aldığım 
        typeahead.js kütüphanesi API key vermeyi durdurmuş, o yüzden kullanıcı adını aratma kısmı
        çalışmıyor, bilginize...
      </div>
      <div>
        Unfortunately, I based the information as API in the check section.
        typeahead.js library has stopped giving API keys, so the username search section is
        It's not working, just for your information...            
      </div> */}
    </>
  )
}

export default App;