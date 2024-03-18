# React Query

### What is React Query?
- TanStack Query (FKA React Query) is often described as the missing data-fetching library for web applications, but in more technical terms, it makes fetching, caching, synchronizing and updating server state in your web applications a breeze.

### But we have useEffect Right?
- Lets consider this code.

```javascript
function Bookmarks({ category }) {
  const [data, setData] = useState([])
  const [error, setError] = useState()

  useEffect(() => {
    fetch(`${endpoint}/${category}`)
      .then(res => res.json())
      .then(d => setData(d))
      .catch(e => setError(e))
  }, [category])

  // Return JSX based on data and error state
}
```
- If you think this code is fine for simple use cases where you don't need additional features, let me tell you that I immediately spotted 🐛 5 bugs 🪲 hiding in these 10 lines of code.

    #### 1. Race Condition
    - The effect is set up in a way that it re-fetches whenever category changes, which is certainly correct. 
    - However, network responses can arrive in a different order than you sent them. So if you change the category from books to movies and the response for books arrives before the response for movies, you'll end up with the wrong data in your component.

    ![alt text](image.png)

    - At the end, you'll be left with an inconsistent state: Your local state will say that you have movies selected, but the data you're rendering is actually books.

    - React says we can fix this issue using ignore.

    ```javascript
    function Bookmarks({ category }) {
  const [data, setData] = useState([])
  const [error, setError] = useState()

  useEffect(() => {
    let ignore = false
    fetch(`${endpoint}/${category}`)
      .then(res => res.json())
      .then(d => {
        if (!ignore) {
          setData(d)
        }
      })
      .catch(e => {
        if (!ignore) {
          setError(e)
        }
      })
      return () => {
        ignore = true
      }
  }, [category])

  // Return JSX based on data and error state
    }
    ```
    - What happens now is that the effect cleanup function runs when category changes, setting the local ignore flag to true. If a fetch response comes in after that, it will not call setState anymore. Easy peasy.


    #### 2. Loading state 
    - It's not there at all. We have no way to show a pending UI while the requests are happening - not for the first one and not for further requests. So, let's add that?

    ```javascript
    function Bookmarks({ category }) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState([])
  const [error, setError] = useState()

  useEffect(() => {
    let ignore = false
    setIsLoading(true)
    fetch(`${endpoint}/${category}`)
      .then(res => res.json())
      .then(d => {
        if (!ignore) {
          setData(d)
        }
      })
      .catch(e => {
        if (!ignore) {
          setError(e)
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false)
        }
      })
      return () => {
        ignore = true
      }
  }, [category])

  // Return JSX based on data and error state
    }   
    ``` 

    #### 3. Empty state
    - Initializing data with an empty array seems like a good idea to avoid having to check for undefined all the time - but what if we fetch data for a category that has no entries yet, and we actually get back an empty array? We'd have no way to distinguish between "no data yet" and "no data at all". The loading state we've just introduced helps, but it's still better to initialize with undefined:

    #### 4. Data & Error are not reset when category changes
    - Both data and error are separate state variables, and they don't get reset when category changes. That means if one category fails, and we switch to another one that is fetched successfully, our state will be:

    ```javascript
    data: dataFromCurrentCategory
    error: errorFromPreviousCategory
    ```

    - The result will then depend on how we actually render JSX based on this state. If we check for error first, we'll render the error UI with the old message even though we have valid data:
    ```javascript
    return (
  <div>
    { error ? (
      <div>Error: {error.message}</div>
    ) : (
      <ul>
        {data.map(item => (
          <li key={item.id}>{item.name}</div>
        ))}
      </ul>
    )}
  </div>
    )
    ```

    - If we check data first, we have the same problem if the second request fails. If we always render both error and data, we're also rendering potentially outdated information . 😔

    - To fix this, we have to reset our local state when category changes:

    ```javascript
    function Bookmarks({ category }) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState()
  const [error, setError] = useState()

  useEffect(() => {
    let ignore = false
    setIsLoading(true)
    fetch(`${endpoint}/${category}`)
      .then(res => res.json())
      .then(d => {
        if (!ignore) {
          setData(d)
          setError(undefined)
        }
      })
      .catch(e => {
        if (!ignore) {
          setError(e)
          setData(undefined)
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false)
        }
      })
      return () => {
        ignore = true
      }
  }, [category])

  // Return JSX based on data and error state
    }
    ```

    - Our little "we just want to fetch data, how hard can it be?" useEffect hook became a giant mess of spaghetti code 🍝 as soon as we had to consider edge cases and state management. So what's the takeaway here?
    - **Data Fetching is simple.
    Async State Management is not.**

    - And this is where React Query comes in, because React Query is NOT a data fetching library - it's an async state manager. So when you say that you don't want it for doing something as simple as fetching data from an endpoint, you're actually right: Even with React Query, you need to write the same fetch code as before.

    - But you still need it to make that state predictably available in your app as easily as possible. Because let's be honest, I haven't written that ignore boolean code before I used React Query, and likely, neither have you. 😉

    - With React Query, the above code becomes:

    ```javascript
    function Bookmarks({ category }) {
  const { isLoading, data, error } = useQuery({
    queryKey: ['bookmarks', category],
    queryFn: () =>
      fetch(`${endpoint}/${category}`).then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch')
        }
        return res.json()
      }),
  })

  // Return JSX based on data and error state
    }
    ```

    That's about 50% of the spaghetti code above, and just about the same amount as the original, buggy snippet was. And yes, this addresses all the bugs we found automatically:

 ####  🐛 Bugs
- 🏎️   There is no race condition because state is always stored by its input (category).
- 🕐   You get loading, data and error states for free, including discriminated unions on type level.
- 🗑️   Empty states are clearly separated and can further be enhanced with features like placeholderData.
- 🔄   You will not get data or error from a previous category unless you opt into it.
- 🔥   Multiple fetches are efficiently deduplicated, including those fired by StrictMode.

####  Cancellation
A lot of folks on twitter mentioned missing request cancellation in the original snippet. I don't think that's necessarily a bug - just a missing feature. Of course, React Query has you covered here as well with a pretty straightforward change:

```javascript
function Bookmarks({ category }) {
  const { isLoading, data, error } = useQuery({
    queryKey: ['bookmarks', category],
    queryFn: ({ signal }) =>
      fetch(`${endpoint}/${category}`, { signal }).then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch')
        }
        return res.json()
      }),
  })

  // Return JSX based on data and error state
}
```

- Just take the signal you get into the queryFn, forward it to fetch, and requests will be aborted automatically when category changes. 🎉


### Installation:

``` 
npm i react-query
```

###  Setup:

```javascript 

import { QueryClientProvider, QueryClient } from "react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient} >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

```

### useQuery:
- This hook required 2 arguments
    - Unique Key to identify the query.
    - function that return promise.
- Here if your using react-router to navigate inside the application  once a page has got its data from the api it gets stored in the react query memory and when you comeback to the same page after browseing other page you donot see loading data but in background react query makes api call's it will only re-render the page if there is change in data from the API.  


 ```javascript
 import { useQuery } from "react-query";
const RqSuperHero = () => {
  const { isLoading, data } = useQuery("super-heros", () => {
    return axios.get("http://localhost:4000/superheroes");
  });

  if (isLoading) {
    return "Loading";
  }
  return (
    <div>
      {data?.data.map((item) => {
        return <li key={item.id}>{item.name}</li>;
      })}
    </div>
  );
};

 ```   

 OR

 ```javascript 

const fetchData=()=>{
    return axios.get("http://localhost:4000/superheroes");
}
const RqSuperHero = () => {  
  const { isLoading, data } = useQuery("super-heros", fetchData);

  if (isLoading) {
    return "Loading";
  }
  return (
    <div>
      {data?.data.map((item) => {
        return <li key={item.id}>{item.name}</li>;
      })}
    </div>
  );
};
 ```

  #### Handling Errors:

  ```javascript
  const fetchData=()=>{
    return axios.get("http://localhost:4000/superheroes1");
}
const RqSuperHero = () => {  
  const { isLoading, data, isError,error } = useQuery("super-heros", fetchData);

  if (isLoading) {
    return "Loading";
  }
  if(isError){
    return error.message;
  }
  return (
    <div>
      {data?.data.map((item) => {
        return <li key={item.id}>{item.name}</li>;
      })}
    </div>
  );
}; 

  ```

### React Query Dev Tools:

![alt text](image-1.png)

### Setup:

```javascript

import {ReactQueryDevtools} from 'react-query/devtools';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient} >
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false}  position="bottom-right"/>
    </QueryClientProvider>
  </React.StrictMode>
);

```
### Caching:

#### isFetching:

- This object provides the status of api call that react query makes underneath, keeping isLoading to false.

```javascript
const {isLoading,isFetching}=useQuery('super-heros',fetchData);

console.log(isLoading,isFetching)

// {isLoading:false, isFetching:true}

```
#### Configure Cache Time:
- Default Cache Time is 5 mins
```javascript
 const { isLoading, data, isError,error } = useQuery("super-heros", fetchData, {cacheTime:5000}); 
```

#### Stale Time:
- Used when you know that data will not change for peroid of time so you stop making api calls to the backend server.

- Example i know that the list of super heros will not change immediately or frequently in short duration of time. we can limit the api call that being made.

```javascript
 const { isLoading, data, isError,error } = useQuery("super-heros", fetchData, {
    stale:30000
  }); 
```

- So here once the data has been fetched data gets cached and when the user again visit the page before expiration of 30 second same old data will be shown to the user and api calls at the background will also not happened till the 30 sec duration.
