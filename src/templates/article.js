import React from 'react'
import { graphql } from 'gatsby'
import cx from 'classnames'
import { dateDifferenceInWords } from 'webkit/utils/dates'
import SEO from '../components/seo'
import Layout from '../components/layout'
import Markdown from '../components/Markdown/Markdown'
import ArticleHeadings from '../components/ArticleHeadings/ArticleHeadings'
import Breadcrumb from '../components/Breadcrumb/Breadcrumb'
import ArticleFooter from '../components/ArticleFooter'
import injectCustomMarkdownComponents from '../components/MarkdownCustomComponents'
import { sluggify } from '../components/Markdown/utils'
import { usePageHash } from "../utils/utils"
import styles from './article.module.scss'


const Template = ({ data, pageContext }) => {
  const { scrollToTargetAdjusted } = usePageHash()
  const { markdownRemark: article } = data
  const {
    breadcrumb: { crumbs },
  } = pageContext
  const meta = {
    title: `${article.frontmatter.title} | Santiment Academy`,
    description: `${article.frontmatter.description || ''}`,
  }
  const lastUpdatedAt = dateDifferenceInWords(
    new Date(article.fields.lastUpdatedAt)
  )

  const rawBodyWithTitle = `# ${article.frontmatter.title}\n${article.rawMarkdownBody}`

  return (
    <Layout isShowSidebar={true}>
      <SEO {...meta} />
      <div className={cx(styles.wrapper, 'container', sluggify(article.frontmatter.title))}>
        <Breadcrumb crumbs={crumbs} crumbLabel={article.frontmatter.title} />
        <ArticleHeadings
          crumbs={crumbs}
          tableOfContents={article.tableOfContents}
          title={article.frontmatter.title}
        />
        <Markdown
          markdown={injectCustomMarkdownComponents(rawBodyWithTitle)}
          scrollToTargetAdjusted={scrollToTargetAdjusted}
        />
        <ArticleFooter lastUpdatedAt={lastUpdatedAt} />
      </div>
    </Layout>
  )
}

export default Template

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      rawMarkdownBody
      frontmatter {
        title
        date
        author
        description
      }
      fields {
        lastUpdatedAt
      }
      tableOfContents(maxDepth: 3)
    }
  }
`
