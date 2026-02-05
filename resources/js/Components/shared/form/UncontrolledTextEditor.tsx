// Import Dependencies
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  ReactNode,
} from "react";
import clsx from "clsx";
import Quill from "quill";
import quillCSS from "quill/dist/quill.snow.css?inline";

// Get Delta type from Quill
type DeltaStatic = ReturnType<InstanceType<typeof Quill>['getContents']>;

// Local Imports
import { InputErrorMsg } from "@/components/ui";
import {
  injectStyles,
  insertStylesToHead,
  makeStyleTag,
} from "@/utils/dom/injectStylesToHead";

// ----------------------------------------------------------------------

const styles = `@layer vendor {
  ${quillCSS}
}

/* Override Quill's default heights */
.ql-container-wrapper {
  display: flex;
  flex-direction: column;
}

.ql-container-wrapper .ql-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ql-container-wrapper .ql-editor {
  min-height: 150px;
  flex: 1;
}`;

const sheet = makeStyleTag();

injectStyles(sheet, styles);
insertStylesToHead(sheet);

const Delta = Quill.import("delta");
const DEFAULT_PLACEHOLDER = "Type here...";

interface UncontrolledTextEditorProps {
  readOnly?: boolean;
  defaultValue?: DeltaStatic;
  onChange?: (html: string, delta: DeltaStatic, quill: Quill) => void;
  placeholder?: string;
  modules?: Record<string, any>;
  className?: string;
  error?: boolean | ReactNode;
  classNames?: {
    root?: string;
    container?: string;
    error?: string;
  };
  label?: ReactNode;
}

interface UncontrolledTextEditorRef {
  getQuillInstance: () => Quill | null;
  blur: () => void;
  focus: () => void;
  hasFocus: () => boolean;
  getHTML: () => string;
  getDelta: () => DeltaStatic;
}

const UncontrolledTextEditor = forwardRef<UncontrolledTextEditorRef, UncontrolledTextEditorProps>(
  (
    {
      readOnly,
      defaultValue,
      onChange,
      placeholder,
      modules,
      className,
      error,
      classNames,
      label,
    },
    forwardedRef,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);
    const isInitializedRef = useRef(false);

    useEffect(() => {
      // Prevent double initialization in React StrictMode
      if (isInitializedRef.current) return;
      
      const container = containerRef.current;
      if (!container) return;

      // Clear any existing content first
      container.innerHTML = "";

      const editorContainer = container.appendChild(
        container.ownerDocument.createElement("div"),
      );

      const quill = new Quill(editorContainer, {
        theme: "snow",
        placeholder: placeholder || DEFAULT_PLACEHOLDER,
        modules: modules || {},
      });

      quill.enable(!readOnly);

      // Set initial content if provided
      if (defaultValue) {
        quill.setContents(defaultValue, 'silent');
      }

      quillRef.current = quill;
      isInitializedRef.current = true;

      // Listen for text changes
      quill.on(Quill.events.TEXT_CHANGE, (delta, oldDelta, source) => {
        if (source === "user" && onChange) {
          const html = quill.root.innerHTML;
          const content = quill.getContents();
          onChange(html, content, quill);
        }
      });

      return () => {
        if (quillRef.current) {
          quillRef.current.off(Quill.events.TEXT_CHANGE);
          quillRef.current = null;
        }
        isInitializedRef.current = false;
        if (container) {
          container.innerHTML = "";
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only initialize once

    useImperativeHandle(forwardedRef, () => ({
      getQuillInstance: () => quillRef.current,
      blur: () => quillRef.current?.blur(),
      focus: () => quillRef.current?.focus(),
      hasFocus: () => quillRef.current?.hasFocus() ?? false,
      getHTML: () => quillRef.current?.root.innerHTML ?? "",
      getDelta: () => quillRef.current?.getContents() ?? new Delta(),
    }));

    return (
      <div
        className={clsx(
          "flex flex-col",
          className,
          error && "ql-error",
          classNames?.root,
        )}
      >
        {label && <label>{label}</label>}
        <div
          className={clsx(
            "ql-container-wrapper",
            label && "mt-1.5!",
            classNames?.container,
          )}
          ref={containerRef}
        ></div>

        <InputErrorMsg
          when={!!error && typeof error !== "boolean"}
          className={classNames?.error}
        >
          {error}
        </InputErrorMsg>
      </div>
    );
  },
);

UncontrolledTextEditor.displayName = "UncontrolledTextEditor";

export { UncontrolledTextEditor };
export type { UncontrolledTextEditorProps, UncontrolledTextEditorRef };

