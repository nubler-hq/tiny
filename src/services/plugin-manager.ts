import { telegram } from '../plugins/telegram.plugin'
import { zapier } from '../plugins/zapier.plugin'
import { make } from '../plugins/make.plugin'
import { discord } from '../plugins/discord.plugin'
import { slack } from '../plugins/slack.plugin'
import { mailchimp } from '../plugins/mailchimp.plugin'
import { PluginManager } from '@/@saas-boilerplate/providers/plugin-manager/provider'

export const plugins = PluginManager.initialize({
  plugins: {
    telegram,
    zapier,
    make,
    discord,
    slack,
    mailchimp,
  },
})
