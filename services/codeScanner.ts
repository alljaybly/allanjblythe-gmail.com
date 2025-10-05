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

    const visitor = {
      Identifier(path: NodePath<t.Identifier>) {
        const featureChecks: { [key: string]: string } = {
          'structuredClone': 'structuredClone',
          'fetch': 'api-fetch',
          'Promise': 'api-promise',
        };
        
        const featureIdPart = featureChecks[path.node.name];

        if (featureIdPart && path.node.loc) {
          const feature = jsFeatures.find(f => f.identifier.includes(featureIdPart));
          if (feature) {
            const status = mapApiStatusToBaselineStatus(feature);
            issues.push({
              file: filename,
              featureId: feature.identifier,
              name: feature.name,
              status: status,
              priority: mapStatusToPriority(status),
              line: path.node.loc.start.line,
              column: path.node.loc.start.column,
            });
          }
        }
      }
    };

    traverse(ast, visitor);

  } catch (error) {
    console.error(`Failed to parse JS in ${filename}:`, error);
  }
  return issues;
};

// --- CSS Scanner ---
export const scanCss = (code: string, filename: string, featureMap: DashboardFeature[]): ScanIssue[] => {
    const issues: ScanIssue[] = [];
    const cssFeatures = featureMap.filter(f => f.identifier.startsWith('css-'));

    try {
        const ast = cssTree.parse(code, { positions: true, onParseError: () => {} });
        cssTree.walk(ast, (node: cssTree.CssNode) => {
            if (node.type === 'Property' && node.loc) {
                const feature = cssFeatures.find(f => f.identifier.includes(node.name));
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
        });
    } catch (error) {
        console.error(`Failed to parse CSS in ${filename}:`, error);
    }
    return issues;
}

// --- HTML Scanner ---
export const scanHtml = (code: string, filename: string, featureMap: DashboardFeature[]): ScanIssue[] => {
    const issues: ScanIssue[] = [];
    const htmlFeatures = featureMap.filter(f => f.identifier.startsWith('html-'));

    const parser = new Parser({
        onopentag(name, attribs) {
            // Unsafe type cast is necessary here because the '@types/htmlparser2' package
            // does not correctly expose the 'line' and 'column' properties on the Parser instance.
            const line = (parser as any).line;
            const col = (parser as any).column;
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
    // Unsafe type cast is necessary as '@types/htmlparser2' is outdated and does not include
    // modern parser options like 'withStartIndices', causing a TS2353 error otherwise.
    }, { xmlMode: false, recognizeSelfClosing: true, withStartIndices: true, withEndIndices: true } as any);

    try {
      parser.write(code);
      parser.end();
    } catch (error) {
       console.error(`Failed to parse HTML in ${filename}:`, error);
    }
    return issues;
};