import * as lodash from 'lodash'

export class Template {
  /**
   * Interpolates a template string with the provided data.
   *
   * @param {string} text - The template string to be interpolated.
   * @param {Record<string, any>} data - The data to be used for interpolation.
   * @returns {(string | undefined)} The interpolated string.
   */
  static interpolate(
    text: string,
    data: Record<string, any>,
  ): string | undefined {
    if (!text) return undefined
    lodash.templateSettings.interpolate = /{{([\s\S]+?)}}/g
    return lodash.template(text)(data)
  }

  /**
   * Recursively interpolates a template object with the provided data.
   *
   * @param {Record<string, any>} template - The template object.
   * @param {Record<string, any>} data - The data for interpolation.
   * @returns {Record<string, any>} The interpolated object.
   */
  static interpolateObject(
    template: Record<string, any>,
    data: Record<string, any>,
  ): Record<string, any> {
    const result: Record<string, any> = {}
    if (!template || Object.keys(template).length === 0) return result

    Object.keys(template).forEach((key) => {
      const value = template[key]
      if (typeof value === 'string') {
        result[key] = this.interpolate(value.trim(), data)
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.interpolateObject(value as Record<string, any>, data)
      } else {
        result[key] = value
      }
    })

    return result
  }

  /**
   * Interpolates an array of template strings with the provided data.
   *
   * @param {string[]} templates - The array of template strings to be interpolated.
   * @param {Record<string, any>} data - The data to be used for interpolation.
   * @returns {string[]} The array of interpolated strings.
   */
  static interpolateArray(
    templates: string[],
    data: Record<string, any>,
  ): string[] {
    return templates.map((template) => this.interpolate(template, data) || '')
  }

  /**
   * Interpolates a template string with the provided data and returns a function.
   *
   * @param {string} text - The template string to be interpolated.
   * @returns {(data: Record<string, any>) => string} The function that takes data and returns the interpolated string.
   */
  static compileTemplate(text: string): (data: Record<string, any>) => string {
    lodash.templateSettings.interpolate = /{{([\s\S]+?)}}/g
    const compiled = lodash.template(text)
    return (data: Record<string, any>) => compiled(data)
  }

  /**
   * Interpolates a template string with the provided data and escapes HTML.
   *
   * @param {string} text - The template string to be interpolated.
   * @param {Record<string, any>} data - The data to be used for interpolation.
   * @returns {(string | undefined)} The interpolated and escaped string.
   */
  static interpolateAndEscape(
    text: string,
    data: Record<string, any>,
  ): string | undefined {
    if (!text) return undefined
    lodash.templateSettings.interpolate = /{{([\s\S]+?)}}/g
    lodash.templateSettings.escape = /{{-([\s\S]+?)}}/g
    return lodash.template(text)(data)
  }
}
