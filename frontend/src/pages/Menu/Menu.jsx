  import React, { useState } from 'react'
  import Header from '../../components/Header/Header'
  import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
  import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
  import AppDownload from '../../components/AppDownload/AppDownload'

  const Menu = () => {

    const [category,setCategory] = useState("All")

    return (
      <>
        <Header/>
        <p>This the test</p>
        <ExploreMenu setCategory={setCategory} category={category}/>
        <FoodDisplay category={category}/>
        
      </>
    )
  }

  export default Menu
