import { collection, config, fields, singleton } from '@keystatic/core';

// Images live in src/assets so Astro can resize them at build time. The stored
// value is the path from the project root (e.g. /src/assets/gallery/x.jpg),
// which src/lib/content.ts resolves to an image import.
const image = (label: string, dir: string) =>
  fields.image({ label, directory: `src/assets/${dir}`, publicPath: `/src/assets/${dir}/` });

export default config({
  // Locally the editor writes straight to these files. On the live site it
  // commits to GitHub instead, and the commit triggers a Vercel rebuild.
  storage: import.meta.env.PROD
    ? { kind: 'github', repo: { owner: 'brian-kilpatrick', name: '23twenty' } }
    : { kind: 'local' },
  ui: {
    brand: { name: '23Twenty Media' },
    navigation: { Site: ['settings', 'home', 'videos'], Photography: ['galleries'] },
  },
  singletons: {
    settings: singleton({
      label: 'Contact & footer',
      path: 'src/content/settings',
      schema: {
        email: fields.text({ label: 'Email' }),
        phone: fields.text({ label: 'Phone number', description: 'Shown as typed, e.g. (267) 277-3498' }),
        facebook: fields.url({ label: 'Facebook page' }),
        instagram: fields.url({ label: 'Instagram profile' }),
        weddings: fields.url({ label: 'Weddings link (menu)' }),
        siteTitle: fields.text({ label: 'Site title (search results)' }),
        siteDescription: fields.text({ label: 'Site description (search results)', multiline: true }),
      },
    }),
    home: singleton({
      label: 'Home page',
      path: 'src/content/home',
      schema: {
        headingBefore: fields.text({ label: 'Heading, before the gold word' }),
        headingAccent: fields.text({ label: 'Gold word' }),
        headingAfter: fields.text({ label: 'Heading, after the gold word' }),
        tagline: fields.text({ label: 'Small caps line under the heading' }),
        photoTile: image('Photo tile', 'home'),
        videoTile: image('Video tile', 'home'),
      },
    }),
    videos: singleton({
      label: 'Video page',
      path: 'src/content/videos',
      schema: {
        description: fields.text({ label: 'Description (search results and link previews)', multiline: true }),
        videos: fields.array(
          fields.object({
            muxPlaybackId: fields.text({ label: 'Mux playback ID', description: "The video's Playback ID in the Mux dashboard (Assets → the video → Playback IDs)" }),
            title: fields.text({ label: 'Title' }),
          }),
          { label: 'Videos', itemLabel: (props) => props.fields.title.value || props.fields.muxPlaybackId.value },
        ),
      },
    }),
  },
  collections: {
    galleries: collection({
      label: 'Galleries',
      path: 'src/content/galleries/*',
      slugField: 'title',
      columns: ['title', 'order'],
      schema: {
        title: fields.slug({ name: { label: 'Title' }, slug: { label: 'Page address', description: '/photo/<this>' } }),
        order: fields.integer({ label: 'Order on the Photography page', defaultValue: 1 }),
        thumbnail: image('Tile photo', 'gallery'),
        intro: fields.text({ label: 'Intro', description: 'A few sentences under the title. Search engines read this.', multiline: true }),
        description: fields.text({
          label: 'Description (search results and link previews)',
          description: 'One or two sentences. Left blank, the intro is used.',
          multiline: true,
        }),
        photos: fields.array(
          fields.object({
            image: image('Photo', 'gallery'),
            alt: fields.text({ label: 'Description' }),
          }),
          { label: 'Photos', itemLabel: (props) => props.fields.alt.value || 'Photo' },
        ),
      },
    }),
  },
});
