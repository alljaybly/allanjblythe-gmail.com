import * as babelParser from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import * as cssTree from 'css-tree';
import { Parser } from 'htmlparser2';
import { ScanIssue, BaselineStatus, DashboardFeature, Priority } from '../types';

// FIX: Export mapApiStatusToBaselineStatus to be used in other components.
export const mapApiStatusToBaselineStatus = (feature?: DashboardFeature): BaselineStatus => {
  if (!feature) return BaselineStatus.Unknown;
  switch (feature.baseline?.status) {
    case 'wide': return BaselineStatus.Widely;
    case 'newly': return BaselineStatus.Newly;
    case 'limited': return BaselineStatus.Limited;
    default: return BaselineStatus.Unknown;
  }
};

const mapStatusToPriority = (status: BaselineStatus): Priority => {
  switch (status) {
    case BaselineStatus.Limited:
      return Priority.High;
    case BaselineStatus.Newly:
      return Priority.Medium;
    case BaselineStatus.Unknown:
    default:
      return Priority.Low;
  }
};


// --- JavaScript Scanner ---
export const scanJavaScript = (code: string, filename: string, featureMap: DashboardFeature[]): ScanIssue[] => {
  const issues: ScanIssue[] = [];
  const jsFeatures = featureMap.filter(f => f.identifier.startsWith('api-') || f.identifier.startsWith('js-'));

  try {
    const ast = babelParser.parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx', 'classProperties', 'classPrivateMethods'],
      errorRecovery: true,
    });

    traverse(ast, {
      enter(path: NodePath<t.Node>) {
        if (path.isIdentifier()) {
          const node = path.node;
          const featureChecks: { [key: string]: string } = {
            'structuredClone': 'structuredClone',
            'fetch': 'api-fetch',
            'Promise': 'api-promise',
          };
          
          const featureIdPart = featureChecks[node.name];

          if (featureIdPart && node.loc) {
            const feature = jsFeatures.find(f => f.identifier.includes(featureIdPart));
            if (feature) {
              const status = mapApiStatusToBaselineStatus(feature);
              issues.push({
                file: filename,
                featureId: feature.identifier,
                name: feature.name,
                status: status,
                priority: mapStatusToPriority(status),
                line: node.loc.start.line,
                column: node.loc.start.column,
              });
            }
          }
        }
      }
    });

  } catch (error) {
    console.error(`Failed to parse JS in ${filename}:`, error);
  }
  return issues;
};

// --- CSS Scanner ---
export const scanCss = (code: string, filename: string, featureMap: DashboardFeature[]): ScanIssue[] => {
    const issues: ScanIssue[] = [];
    const cssFeatures = featureMap.filter(f => f.identifier.startsWith('css-properties-'));

    try {
        const ast = cssTree.parse(code, { positions: true, onParseError: () => {} });
        
        // Use cssTree.walk to traverse the AST. We're looking for 'Declaration' nodes.
        cssTree.walk(ast, {
            enter: (node: cssTree.CssNode) => {
                // A 'Declaration' node represents a full 'property: value' pair.
                // This is the correct type to check, resolving the original TS error.
                if (node.type === 'Declaration') {
                    const propertyName = node.property;

                    // 1. Check for features that are just the property name itself (e.g., 'container-type').
                    const propFeature = cssFeatures.find(f => f.identifier === `css-properties-${propertyName}`);
                    if (propFeature) {
                        const status = mapApiStatusToBaselineStatus(propFeature);
                        if (status === BaselineStatus.Limited) {
                            issues.push({
                                file: filename,
                                featureId: propFeature.identifier,
                                name: propFeature.name,
                                status: status,
                                priority: mapStatusToPriority(status),
                                line: node.loc?.start.line ?? 1, // Use optional chaining for safety
                                column: node.loc?.start.column ?? 1,
                            });
                        }
                    }

                    // 2. Traverse the 'value' of the declaration to find specific keyword values (like 'subgrid').
                    cssTree.walk(node.value, (valueNode) => {
                        if (valueNode.type === 'Identifier') {
                            const valueName = valueNode.name;
                            const featureIdentifier = `css-properties-${propertyName}-${valueName}`;
                            const valueFeature = cssFeatures.find(f => f.identifier === featureIdentifier);

                            if (valueFeature) {
                                const status = mapApiStatusToBaselineStatus(valueFeature);
                                if (status === BaselineStatus.Limited || status === BaselineStatus.Newly) {
                                    issues.push({
                                        file: filename,
                                        featureId: valueFeature.identifier,
                                        name: `${propertyName}: ${valueName}`,
                                        status: status,
                                        priority: mapStatusToPriority(status),
                                        line: valueNode.loc?.start.line ?? node.loc?.start.line ?? 1,
                                        column: valueNode.loc?.start.column ?? node.loc?.start.column ?? 1,
                                    });
                                }
                            }
                        }
                    });
                }
            }
        });
    } catch (error) {
        console.error(`Failed to parse CSS in ${filename}:`, error);
    }
    // Return unique issues, as some logic might overlap.
    return [...new Map(issues.map(item => [`${item.featureId}@${item.line}`, item])).values()];
};


// --- HTML Scanner ---
export const scanHtml = (code: string, filename: string, featureMap: DashboardFeature[]): ScanIssue[] => {
    const issues: ScanIssue[] = [];
    const htmlFeatures = featureMap.filter(f => f.identifier.startsWith('html-'));

    const parser = new Parser({
        onopentag(name, attribs) {
            // Unsafe type cast to 'any' is necessary because '@types/htmlparser2' is outdated
            // and does not include the `getLocation` method or `withLocations` option.
            const loc = (parser as any).getLocation();
            const line = loc ? loc.line : 0;
            const col = loc ? loc.col : 0;
            
            // Check for tags
            const tagFeature = htmlFeatures.find(f => f.identifier.includes(`element-${name}`));
            if (tagFeature) {
                const status = mapApiStatusToBaselineStatus(tagFeature);
                issues.push({
                    file: filename,
                    featureId: tagFeature.identifier,
                    name: tagFeature.name,
                    status: status,
                    priority: mapStatusToPriority(status),
                    line: line,
                    column: col,
                });
            }
            // Check for attributes
            for (const attr in attribs) {
                 const attrFeature = htmlFeatures.find(f => f.identifier.includes(`attribute-${attr}`));
                 if (attrFeature) {
                     const status = mapApiStatusToBaselineStatus(attrFeature);
                     issues.push({
                        file: filename,
                        featureId: attrFeature.identifier,
                        name: attrFeature.name,
                        status: status,
                        priority: mapStatusToPriority(status),
                        line: line,
                        column: col,
                     });
                 }
            }
        }
    // The options object is cast to 'any' to allow 'withLocations', which is a valid
    // option in htmlparser2 v9 but is missing from the outdated type definitions.
    }, { xmlMode: false, recognizeSelfClosing: true, withStartIndices: true, withEndIndices: true, withLocations: true } as any);

    try {
      parser.write(code);
      parser.end();
    } catch (error) {
       console.error(`Failed to parse HTML in ${filename}:`, error);
    }
    return issues;
};