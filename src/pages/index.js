import React from 'react'
import Layout from '../components/layout'
import SEO from '../components/seo'
// import Search from '../components/Search/Search'
import Markdown from './../components/Markdown/Markdown'
import Category from '../components/Category/Category'
import {docs} from '../utils/docs'
import GettingStarted from "../components/GettingStarted/GettingStarted"
import styles from './index.module.scss'

const IndexPage = () => (
  <Layout>
    <SEO title="Academy - Santiment Technical Documentation" />
    <section className={styles.wrapper}>
    	{/* <Search /> */}
      <div className='container'>
      <GettingStarted className={styles.startBlock}/>
      {docs.map(({title, ...rest}) => <Category key={title} title={title} {...rest} />)}
      </div>
    </section>
  </Layout>
)

export default IndexPage
