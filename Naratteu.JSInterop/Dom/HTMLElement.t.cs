namespace Naratteu.JSInterop.Dom;

using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

partial class HTMLElement
{
    /// <GenHere />
}
/// <GenEnd />

public partial class HTMLElement(IJSRuntime js)
{
    public ElementReference Ref;
}