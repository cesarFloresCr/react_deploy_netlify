import Header from './Header'
import SearchItem from './SearchItem';
import AddItem from './AddItem';
import Content from './Content';
import Footer from './Footer';
import { useState, useEffect } from 'react';
import apiRequest from './apiRequest';

function App() {
  const API_URL = 'http://localhost:3500/items';


  /*local storage*/
  /*
  const [ items,setItems ] = useState(JSON.parse(localStorage.getItem('shoppinglist')) || []);
  */
  /*server storage */
  const [ items,setItems ] = useState([]);

  const [ newItem, setNewItem] = useState('');
  const [ search, setSearch ] = useState('');

  const [ fetchError, setFetchError ] = useState(null);

  const [ isLoading,setIsLoading] = useState(true);

/*local storage*/
    /*cada vez que se actuliza items se guarda en el local storage*/
/*
  useEffect (()=> {
    localStorage.setItem('shoppinglist', JSON.stringify(items))
  },[items])
  */

/*server storage*/
  useEffect ( ()=> {
    const fetchItems = async() => {
      try{
        const response= await fetch(API_URL);
        if(!response.ok) throw Error('Did not receive expected data');
        const listItems = await response.json();
        //console.log(listItems);
        setItems(listItems);
        setFetchError(null)
      }catch (err){
       // console.log(err.message);
       setFetchError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    setTimeout(()=> {
      fetchItems()
    },2000)
 //(async () => await fetchItems())();
    //fetchItems();
  },[])


/*
  const setAndSaveItems = (newItems) => {
    setItems(newItems);
    localStorage.setItem('shoppinglist', JSON.stringify(newItems))
  }
*/
  const addItem = async (item) => {
    const id = items.length ? items[items.length - 1].id + 1 : 1;
    const myNewItem = { id, checked:false, item};
    const listItems = [...items, myNewItem] ;
    setItems(listItems);

    const postOptions = {
      method: 'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify(myNewItem)
    }
    const result = await apiRequest(API_URL, postOptions);
    if(result) setFetchError(result);
  } 

  const handleCheck = async(id) => {
    //console.log(`key: ${id}`);
    const listItems = items.map((item)=> item.id === id ? {...item,checked:!item.checked } : item);
    setItems(listItems);//aqui react cambia el estado

    /* aqui se cambia la base de datos */
    const myItem = listItems.filter((item) => item.id === id);
    const updateOptions = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ checked: myItem[0].checked})
    };
    const reqUrl = `${API_URL}/${id}`;

    const result = await apiRequest(reqUrl, updateOptions);
    if(result) setFetchError(result);
  }

  const handleDelete = async(id)=> {
    //console.log(id);
    const listItems = items.filter((item) => item.id !== id );
    setItems(listItems);//cambio a nivel react

    //cambio en bd

    const deleteOptions = { method: 'DELETE'};
    const reqUrl = `${API_URL}/${id}`;
    const result = await apiRequest(reqUrl,deleteOptions);
    if (result) setFetchError(result);
}

const handleSubmit = (e) => {
  e.preventDefault();
  if(!newItem)return;
  
  //add item
  addItem(newItem);
  setNewItem('');
  
}


  return (
    <div className="App">
      <Header title="Groceries List"/>    
      <AddItem
        newItem = {newItem}
        setNewItem = {setNewItem}
        handleSubmit = {handleSubmit}
      />
      <SearchItem
        search={search}
        setSearch={setSearch}
      />
      <main>
        {isLoading && <p>Loding Items...</p>}
        {fetchError && <p style={{color:"red"}}>{`Error: ${fetchError}`}</p>}
        {!fetchError && !isLoading && <Content 
          items={items.filter(item => ((item.item).toLowerCase()).includes(search.toLowerCase()))}
          handleCheck = {handleCheck}
          handleDelete = {handleDelete}
        />}
      </main>
      <Footer length={items.length}/>
    </div>
  );
}

export default App;
